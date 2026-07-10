import { expect, test } from "@playwright/test";

test.describe("smoke — landing i bramka dostępu", () => {
  test("landing nie ujawnia katalogu edukacyjnego", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Matematyka prowadzona przez nauczyciela." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Zaloguj się" })).toBeVisible();
    await expect(page.getByText("Symulacje demonstracyjne")).toHaveCount(0);
  });

  for (const path of ["/symulacje", "/symulacje/os-liczbowa", "/program/klasa-5", "/klasy/5"]) {
    test(`${path} wymaga logowania`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/logowanie\\?next=${encodeURIComponent(path).replaceAll("/", "%2F")}`));
    });
  }
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
