// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SharedDevicePasswordLogin } from "@/components/auth/SharedDevicePasswordLogin";

describe("SharedDevicePasswordLogin", () => {
  it("wyłącza autouzupełnianie i oznacza dane do pominięcia przez menedżery haseł", () => {
    render(<SharedDevicePasswordLogin />);

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Hasło");

    expect(email).toHaveAttribute("autocomplete", "off");
    expect(password).toHaveAttribute("autocomplete", "off");
    expect(email).toHaveAttribute("data-1p-ignore", "true");
    expect(password).toHaveAttribute("data-lpignore", "true");
    expect(password).toHaveAttribute("data-bwignore", "true");
  });

  it("czyści email i hasło po przywróceniu strony przyciskiem Wstecz", () => {
    render(<SharedDevicePasswordLogin />);

    const email = screen.getByLabelText("Email") as HTMLInputElement;
    const password = screen.getByLabelText("Hasło") as HTMLInputElement;
    fireEvent.change(email, { target: { value: "uczen@example.com" } });
    fireEvent.change(password, { target: { value: "sekret" } });

    window.dispatchEvent(new Event("pageshow"));

    expect(email.value).toBe("");
    expect(password.value).toBe("");
  });
});
