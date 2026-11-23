"use client";

import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  path: string;
}

export default function CopyLinkButton({ path }: CopyLinkButtonProps) {
  async function handleClick() {
    // The origin is known only in the browser, so the full URL is built on click.
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopyalandı.");
    } catch {
      toast.error("Link kopyalanamadı.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <CopyIcon aria-hidden />
      Linki kopyala
    </Button>
  );
}
