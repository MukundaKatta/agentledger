"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SendTestRun() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function go() {
    setLoading(true);
    try {
      await fetch("/api/demo", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn" onClick={go} disabled={loading}>
      {loading ? "Sending…" : "Send test run"}
    </button>
  );
}
