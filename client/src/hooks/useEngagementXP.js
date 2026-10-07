import { useEffect, useRef } from "react";
import api from "../utils/api";

// Lightweight engagement tracker:
// - pageview: on route change
// - click: throttled
// - activeMinute: once per minute while user is active + tab is visible
export default function useEngagementXP({ enabled, onUserUpdate, pathname }) {
  const lastClickAtRef = useRef(0);
  const lastPageviewKeyRef = useRef("");
  const lastActivityAtRef = useRef(Date.now());
  const lastRouteEnterAtRef = useRef(Date.now());

  const postEvent = async (payload) => {
    try {
      const res = await api.post("/user/interaction", payload);
      if (res?.data?.user && typeof onUserUpdate === "function") {
        onUserUpdate((prev) => ({ ...(prev || {}), ...res.data.user }));
      }
    } catch {
      // Non-fatal: engagement XP should never break the app.
    }
  };

  // Track route changes
  useEffect(() => {
    if (!enabled) return;
    if (!pathname) return;

    const key = `pageview:${pathname}`;
    if (lastPageviewKeyRef.current === key) return;
    lastPageviewKeyRef.current = key;

    const now = Date.now();
    const dwellMs = now - (lastRouteEnterAtRef.current || now);

    postEvent({ event: "pageview", path: pathname, dwellMs });

    // Mark the time the user landed on this new route so the *next*
    // navigation has an accurate dwell time.
    lastRouteEnterAtRef.current = now;
  }, [enabled, pathname]);

  // Track basic activity to gate active-minute rewards
  useEffect(() => {
    if (!enabled) return;

    const bump = () => {
      lastActivityAtRef.current = Date.now();
    };

    window.addEventListener("click", bump, { passive: true });
    window.addEventListener("keydown", bump, { passive: true });
    window.addEventListener("scroll", bump, { passive: true });

    return () => {
      window.removeEventListener("click", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("scroll", bump);
    };
  }, [enabled]);

  // Click XP (throttled)
  useEffect(() => {
    if (!enabled) return;

    const onClick = () => {
      const now = Date.now();
      // Client-side throttle (server also has cooldown)
      if (now - lastClickAtRef.current < 2000) return;
      lastClickAtRef.current = now;
      postEvent({ event: "click" });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [enabled]);

  // Active minute XP
  useEffect(() => {
    if (!enabled) return;

    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();

      // Only award if the user interacted recently (last 60s)
      if (now - lastActivityAtRef.current > 60_000) return;
      postEvent({ event: "activeMinute" });
    }, 60_000);

    return () => window.clearInterval(id);
  }, [enabled]);
}
