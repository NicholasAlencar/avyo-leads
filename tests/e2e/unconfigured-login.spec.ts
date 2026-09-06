import { test, expect } from "@playwright/test";

test("missing credentials keep login disabled", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("INTEGRAÇÃO NÃO CONFIGURADA")).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar" })).toBeDisabled();
});

test("protected routes redirect to login instead of exposing data or crashing", async ({ page }) => {
  for (const path of ["/dashboard", "/leads", "/pipeline", "/follow-ups"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?reason=not_configured$/);
    await expect(page.getByRole("button", { name: "Entrar" })).toBeDisabled();
  }
});
