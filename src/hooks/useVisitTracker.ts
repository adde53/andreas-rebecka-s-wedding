import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "ok_visit_session_id";
const HEARTBEAT_MS = 15000;

export const useVisitTracker = () => {
  useEffect(() => {
    let sessionId = sessionStorage.getItem(STORAGE_KEY);
    const startedAt = Date.now();
    let cancelled = false;

    const init = async () => {
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(STORAGE_KEY, sessionId);
        await supabase.from("site_visits").insert({
          session_id: sessionId,
          user_agent: navigator.userAgent.slice(0, 500),
        });
      }
    };

    const heartbeat = async () => {
      if (cancelled || !sessionId) return;
      const duration = Math.floor((Date.now() - startedAt) / 1000);
      await supabase
        .from("site_visits")
        .update({
          last_seen_at: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq("session_id", sessionId);
    };

    init();
    const interval = setInterval(heartbeat, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") heartbeat();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", heartbeat);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", heartbeat);
    };
  }, []);
};
