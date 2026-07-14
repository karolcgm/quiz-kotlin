"use server";

import { createHash, randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { createStudentQrPayload, extractStudentQrToken, isFourDigitPin } from "@/lib/auth/studentQr";
import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type StudentQrLoginState = {
  status: "idle" | "error";
  message: string;
};

export type StudentQrSetupState = {
  status: "idle" | "error" | "success";
  message: string;
  qrDataUrl?: string;
  downloadName?: string;
  changedAt?: number;
};

export type StudentQrDisableState = {
  status: "idle" | "error" | "success";
  message: string;
  changedAt?: number;
};

type VerifyQrRow = {
  outcome: "ok" | "invalid" | "locked";
  student_id: string | null;
  retry_after_seconds: number | null;
};

function hashQrToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function safeFilePart(value: string): string {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "uczen";
}

function genericLoginError(): StudentQrLoginState {
  return {
    status: "error",
    message: "Nie udało się zalogować. Zeskanuj swój kod ponownie i sprawdź PIN.",
  };
}

export async function studentQrLoginAction(
  _previousState: StudentQrLoginState,
  formData: FormData,
): Promise<StudentQrLoginState> {
  const payload = formData.get("qrPayload");
  const pinValue = formData.get("pin");
  const token = typeof payload === "string" ? extractStudentQrToken(payload) : null;
  const pin = typeof pinValue === "string" ? pinValue.trim() : "";

  if (!token || !isFourDigitPin(pin)) {
    return genericLoginError();
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("verify_student_qr_login", {
      target_token_hash: hashQrToken(token),
      target_pin: pin,
    });

    if (error) {
      console.error("QR login verification failed", error.message);
      return genericLoginError();
    }

    const verification = (Array.isArray(data) ? data[0] : data) as VerifyQrRow | null;
    if (verification?.outcome === "locked") {
      const seconds = Math.max(1, Number(verification.retry_after_seconds ?? 900));
      const minutes = Math.max(1, Math.ceil(seconds / 60));
      return {
        status: "error",
        message: `Po kilku błędnych próbach logowanie zostało wstrzymane. Spróbuj ponownie za ${minutes} min.`,
      };
    }

    if (verification?.outcome !== "ok" || !verification.student_id) {
      return genericLoginError();
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      verification.student_id,
    );
    const email = userData.user?.email;
    if (userError || !email) {
      console.error("QR login user lookup failed", userError?.message ?? "missing email");
      return genericLoginError();
    }

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      console.error("QR login session link failed", linkError?.message ?? "missing token hash");
      return genericLoginError();
    }

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

    if (sessionError) {
      console.error("QR login session verification failed", sessionError.message);
      return genericLoginError();
    }
  } catch (error) {
    console.error("QR login unavailable", error instanceof Error ? error.message : error);
    return genericLoginError();
  }

  redirect("/uczen");
}

export async function configureStudentQrAction(
  _previousState: StudentQrSetupState,
  formData: FormData,
): Promise<StudentQrSetupState> {
  const profile = await requireRole("student");
  const pinValue = formData.get("pin");
  const confirmationValue = formData.get("pinConfirmation");
  const pin = typeof pinValue === "string" ? pinValue.trim() : "";
  const confirmation = typeof confirmationValue === "string" ? confirmationValue.trim() : "";

  if (!isFourDigitPin(pin)) {
    return {
      status: "error",
      message: "PIN musi składać się z dokładnie czterech cyfr.",
    };
  }

  if (pin !== confirmation) {
    return {
      status: "error",
      message: "Wpisane numery PIN nie są takie same.",
    };
  }

  const token = randomBytes(32).toString("base64url");
  const payload = createStudentQrPayload(token);
  const supabase = await createClient();
  const { error } = await supabase.rpc("configure_student_qr_login", {
    target_token_hash: hashQrToken(token),
    target_pin: pin,
  });

  if (error) {
    console.error("QR login setup failed", error.message);
    return {
      status: "error",
      message: "Nie udało się utworzyć kodu QR. Spróbuj ponownie za chwilę.",
    };
  }

  const qrDataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 4,
    width: 1024,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
  const displayName = profile.displayName ?? profile.firstName ?? "uczen";

  return {
    status: "success",
    message: "Nowy kod QR i PIN są aktywne. Poprzedni kod, jeśli istniał, przestał działać.",
    qrDataUrl,
    downloadName: `lekcjalab-${safeFilePart(displayName)}-qr.png`,
    changedAt: Date.now(),
  };
}

export async function disableStudentQrAction(
  _previousState: StudentQrDisableState,
  _formData: FormData,
): Promise<StudentQrDisableState> {
  void _previousState;
  void _formData;
  await requireRole("student");
  const supabase = await createClient();
  const { error } = await supabase.rpc("disable_student_qr_login");

  if (error) {
    console.error("QR login disable failed", error.message);
    return {
      status: "error",
      message: "Nie udało się wyłączyć logowania QR. Spróbuj ponownie.",
    };
  }

  return {
    status: "success",
    message: "Logowanie tym kodem QR zostało wyłączone.",
    changedAt: Date.now(),
  };
}
