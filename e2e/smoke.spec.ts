import { expect, test } from "@playwright/test";

test.describe("smoke — publiczny katalog", () => {
  test("strona symulacji ładuje się bez logowania", async ({ page }) => {
    await page.goto("/symulacje");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveURL(/\/symulacje/);
  });
});

test.describe("smoke — logowanie", () => {
  test("formularz logowania jest dostępny", async ({ page }) => {
    await page.goto("/logowanie");
    await expect(page.getByRole("heading", { name: "Logowanie" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Hasło")).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj" })).toBeVisible();
  });
});

test.describe("smoke — chroniona trasa", () => {
  test("panel nauczyciela wymaga logowania", async ({ page }) => {
    await page.goto("/nauczyciel");
    await expect(page).toHaveURL(/\/logowanie/);
  });
});

test.describe("smoke — opcjonalne logowanie testowe", () => {
  test("zalogowany uczeń widzi panel", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_STUDENT_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_STUDENT_PASSWORD;

    test.skip(!email || !password, "Ustaw PLAYWRIGHT_TEST_STUDENT_EMAIL i PLAYWRIGHT_TEST_STUDENT_PASSWORD");

    await page.goto("/logowanie");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Hasło").fill(password!);
    await page.getByRole("button", { name: "Zaloguj" }).click();

    await expect(page).toHaveURL(/\/uczen/);
  });
});
