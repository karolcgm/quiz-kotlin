"use client";

import { useEffect } from "react";

/**
 * Po wylogowaniu przeglądarka nie może pokazać z pamięci ekranu poprzedniego ucznia.
 * Przywróconą z bfcache stronę ładujemy ponownie, aby Proxy ponownie sprawdziło sesję.
 */
export function SharedDeviceSessionGuard() {
  useEffect(() => {
    const verifyRestoredPage = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", verifyRestoredPage);
    return () => window.removeEventListener("pageshow", verifyRestoredPage);
  }, []);

  return null;
}
