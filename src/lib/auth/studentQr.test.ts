import { describe, expect, it } from "vitest";
import {
  createStudentQrPayload,
  extractStudentQrToken,
  isFourDigitPin,
} from "@/lib/auth/studentQr";

const validToken = "A".repeat(43);

describe("student QR payload", () => {
  it("tworzy i odczytuje kod LekcjaLab bez ujawniania danych ucznia", () => {
    const payload = createStudentQrPayload(validToken);

    expect(payload).toBe(`lekcjalab:student-login:v1:${validToken}`);
    expect(extractStudentQrToken(payload)).toBe(validToken);
    expect(payload).not.toContain("@");
  });

  it("akceptuje białe znaki wokół zeskanowanej wartości", () => {
    expect(extractStudentQrToken(`  ${createStudentQrPayload(validToken)}\n`)).toBe(validToken);
  });

  it.each([
    "https://example.com/qr",
    "lekcjalab:student-login:v1:abc",
    `lekcjalab:student-login:v2:${validToken}`,
    `lekcjalab:student-login:v1:${validToken}!`,
  ])("odrzuca obcy lub uszkodzony kod: %s", (payload) => {
    expect(extractStudentQrToken(payload)).toBeNull();
  });

  it("nie pozwala wygenerować kodu z nieprawidłowego tokenu", () => {
    expect(() => createStudentQrPayload("za-krotki")).toThrow("Nieprawidłowy token QR ucznia.");
  });
});

describe("student QR PIN", () => {
  it.each(["0000", "1234", "9876"])("akceptuje dokładnie cztery cyfry: %s", (pin) => {
    expect(isFourDigitPin(pin)).toBe(true);
  });

  it.each(["123", "12345", "12a4", " 1234", "1234 ", ""])("odrzuca zły PIN: %s", (pin) => {
    expect(isFourDigitPin(pin)).toBe(false);
  });
});
