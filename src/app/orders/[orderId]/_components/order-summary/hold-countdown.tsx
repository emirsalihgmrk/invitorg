"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HoldCountdownProps {
  expiresAt: Date;
}

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function HoldCountdown({ expiresAt }: HoldCountdownProps) {
  const router = useRouter();
  // Unknown until mounted, so the server and the first client render match.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      const left = expiresAt.getTime() - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(intervalId);
        // The server now reports the order as expired.
        router.refresh();
      }
    }
    const timeoutId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [expiresAt, router]);

  return (
    <time className="tabular-nums" role="timer">
      {remaining === null ? "–:––" : formatRemaining(remaining)}
    </time>
  );
}
