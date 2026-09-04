import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerSupabaseClient, redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
  createServerSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabaseClient }));

import { requireMember } from "./require-member";

function createClient({
  user = null,
  membership = null,
}: {
  user?: { id: string } | null;
  membership?: {
    organization_id: string;
    role: "admin" | "manager" | "member";
    profiles: { display_name: string } | null;
  } | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: membership, error: null });
  const eqStatus = vi.fn(() => ({ maybeSingle }));
  const eqUser = vi.fn(() => ({ eq: eqStatus }));
  const select = vi.fn(() => ({ eq: eqUser }));
  const from = vi.fn(() => ({ select }));

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from,
  };
}

describe("requireMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects absent sessions to login", async () => {
    createServerSupabaseClient.mockResolvedValue(createClient({}));

    await expect(requireMember()).rejects.toThrow("redirect:/login");
  });

  it("denies access when no active membership exists", async () => {
    createServerSupabaseClient.mockResolvedValue(
      createClient({ user: { id: "4a90b17c-76de-4854-93e7-e172a5952b91" } }),
    );

    await expect(requireMember()).rejects.toThrow("redirect:/login?reason=membership");
  });

  it("returns only the active server-resolved organization context", async () => {
    createServerSupabaseClient.mockResolvedValue(
      createClient({
        user: { id: "4a90b17c-76de-4854-93e7-e172a5952b91" },
        membership: {
          organization_id: "69e6fc24-5310-4a0d-a43b-22a557fb3820",
          role: "manager",
          profiles: { display_name: "Nicholas" },
        },
      }),
    );

    await expect(requireMember()).resolves.toEqual({
      userId: "4a90b17c-76de-4854-93e7-e172a5952b91",
      organizationId: "69e6fc24-5310-4a0d-a43b-22a557fb3820",
      role: "manager",
      name: "Nicholas",
    });
  });
});
