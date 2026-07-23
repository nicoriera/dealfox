import { expect, test } from "@playwright/test";

test("crée une décision et expose le parcours", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Le bon achat/ })).toBeVisible();
  await page.getByLabel("Nom de la décision").fill("Cargo de test");
  await page.getByLabel("Usages").fill("Deux enfants et courses");
  await page.getByRole("button", { name: "Créer la décision" }).click();
  await expect(page.getByRole("heading", { name: "Cargo de test" })).toBeVisible();
  await expect(page.getByText(/100 points de poids/)).toBeVisible();
});
