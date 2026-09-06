import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, afterAll, afterEach, describe, it, expect } from "vitest";

// Test-only PostgreSQL engine. Production continues to use Supabase exclusively.
const db = new PGlite();
const org = "20000000-0000-4000-8000-000000000001";
const user = "10000000-0000-4000-8000-000000000001";
const foreignUser = "10000000-0000-4000-8000-000000000002";
const lead = "30000000-0000-4000-8000-000000000001";
const foreignLead = "30000000-0000-4000-8000-000000000002";

beforeAll(async () => {
  // Minimal Auth schema for SQL authorization tests; does not emulate GoTrue/JWT verification.
  await db.exec(`create role anon; create role authenticated;
    create schema auth; create schema extensions;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;`);
  const directory = resolve("supabase/migrations");
  for (const name of readdirSync(directory).filter((name) => name.endsWith(".sql")).sort()) {
    try { await db.exec(readFileSync(resolve(directory, name), "utf8")); }
    catch (error) { throw new Error(`Migration ${name}: ${(error as Error).message}`, { cause: error }); }
  }
  await db.exec(`insert into auth.users values ('${user}', 'a@example.test'), ('${foreignUser}', 'b@example.test');
    insert into public.profiles (id, display_name, email) values ('${user}', 'Test A', 'a@example.test'), ('${foreignUser}', 'Test B', 'b@example.test');
    insert into public.organizations (id, name, slug) values ('${org}', 'Test A', 'test-a'), ('20000000-0000-4000-8000-000000000002', 'Test B', 'test-b');
    insert into public.organization_members (organization_id, user_id, role, status, joined_at) values
      ('${org}', '${user}', 'member', 'active', now()), ('20000000-0000-4000-8000-000000000002', '${foreignUser}', 'member', 'active', now());
    insert into public.leads (id, organization_id, company_name, normalized_name) values
      ('${lead}', '${org}', 'Test Lead A', 'test lead a'),
      ('${foreignLead}', '20000000-0000-4000-8000-000000000002', 'Test Lead B', 'test lead b');`);
}, 30000);
beforeEach(async () => { await db.exec(`begin; set local role authenticated; set local request.jwt.claim.sub = '${user}';`); });
afterEach(async () => { await db.exec("rollback;"); });
afterAll(async () => { await db.close(); });

async function createFollowup(due = "2026-09-10T10:00:00Z", owner = user, target = lead) {
  const result = await db.query<{ id: string }>("select public.create_followup($1, $2, $3, $4) as id", [org, target, owner, due]);
  return result.rows[0].id;
}

describe("PostgreSQL migrations and workflow", () => {
  it("applies every migration and limits reads to the active organization", async () => {
    const result = await db.query("select id from public.leads");
    expect(result.rows).toEqual([{ id: lead }]);
  });
  it("persists follow-ups, history and nearest deadline atomically", async () => {
    await createFollowup();
    await createFollowup("2026-09-09T10:00:00Z");
    const result = await db.query<{ due: string; activities: number; audits: number }>(`select next_followup_at::text as due,
      (select count(*)::int from public.activities where type = 'FOLLOWUP_CREATED') as activities,
      (select count(*)::int from public.audit_logs where entity_type = 'followups') as audits from public.leads where id = $1`, [lead]);
    expect(result.rows[0].due).toContain("2026-09-09");
    expect(result.rows[0].activities).toBe(2); expect(result.rows[0].audits).toBe(2);
  });
  it("completes once and clears the last pending deadline", async () => {
    const id = await createFollowup();
    await db.query("select public.finish_followup($1, $2, 'COMPLETED')", [org, id]);
    expect((await db.query("select next_followup_at from public.leads where id = $1", [lead])).rows).toEqual([{ next_followup_at: null }]);
    expect((await db.query("select status, completed_at is not null as stamped from public.followups where id = $1", [id])).rows).toEqual([{ status: "COMPLETED", stamped: true }]);
    await expect(db.query("select public.finish_followup($1, $2, 'COMPLETED')", [org, id])).rejects.toMatchObject({ code: "40001" });
  });
  it("rejects assigning follow-ups to a foreign organization member", async () => {
    await expect(createFollowup(undefined, foreignUser)).rejects.toMatchObject({ code: "23514" });
  });
  it("rejects creating follow-ups for a foreign lead", async () => {
    await expect(createFollowup(undefined, user, foreignLead)).rejects.toMatchObject({ code: "P0002" });
  });
  it("records cancellation without marking a contact as sent", async () => {
    const id = await createFollowup();
    await db.query("select public.finish_followup($1, $2, 'CANCELLED')", [org, id]);
    expect((await db.query("select contacted_at from public.leads where id = $1", [lead])).rows).toEqual([{ contacted_at: null }]);
    expect((await db.query("select status, cancelled_at is not null as stamped from public.followups where id = $1", [id])).rows).toEqual([{ status: "CANCELLED", stamped: true }]);
  });
  it("moves a lead with history and rejects a stale expected stage", async () => {
    await db.query("select public.change_lead_stage_with_activity($1,$2,$3,'NEW','ANALYZING',false)", [org, user, lead]);
    expect((await db.query("select pipeline_stage from public.leads where id = $1", [lead])).rows).toEqual([{ pipeline_stage: "ANALYZING" }]);
    await expect(db.query("select public.change_lead_stage_with_activity($1,$2,$3,'NEW','PRIORITY',false)", [org, user, lead])).rejects.toMatchObject({ code: "40001" });
  });
});
