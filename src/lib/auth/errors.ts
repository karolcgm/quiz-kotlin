import type { AuthError } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  user_already_exists: "Konto z tym adresem email już istnieje. Zaloguj się lub użyj innego emaila.",
  email_address_invalid: "Nieprawidłowy adres email.",
  weak_password: "Hasło jest zbyt słabe — użyj co najmniej 8 znaków.",
  signup_disabled: "Rejestracja jest wyłączona. Skontaktuj się z nauczycielem.",
};

export function formatAuthError(error: AuthError | Error | unknown): string {
  if (!error) {
    return "Wystąpił nieznany błąd. Spróbuj ponownie.";
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const authError = error as AuthError;
    const message = authError.message?.trim();

    if (message && message !== "{}" && message !== "[object Object]") {
      if (message.includes("Database error saving new user")) {
        return "Nie udało się utworzyć konta. Sprawdź, czy link zaproszenia jest ważny, i spróbuj ponownie.";
      }
      if (message.includes("Wybrana klasa nie zgadza się")) {
        return "Wybrana klasa nie zgadza się z zaproszeniem. Odśwież stronę z linku nauczyciela.";
      }
      return message;
    }

    if ("code" in authError && typeof authError.code === "string") {
      const mapped = AUTH_ERROR_MESSAGES[authError.code];
      if (mapped) return mapped;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Wystąpił nieznany błąd. Spróbuj ponownie.";
}
