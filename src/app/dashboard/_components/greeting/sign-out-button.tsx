"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    const result = await signOutAction();
    if (!result.ok) {
      setIsPending(false);
      toast.error(result.error);
      return;
    }
    // The action cleared the session cookie, which already invalidates the
    // router cache, so a client navigation is enough here.
    router.replace("/login");
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={isPending}>
      Çıkış yap
    </Button>
  );
}
