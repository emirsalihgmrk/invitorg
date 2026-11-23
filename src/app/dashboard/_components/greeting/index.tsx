import { redirect } from "next/navigation";

import { getCurrentUserService } from "@/services/auth";

import SignOutButton from "./sign-out-button";

export default async function Greeting() {
  const user = await getCurrentUserService();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Merhaba, {user.name || user.email}</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}

export function GreetingFallback() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
    </div>
  );
}
