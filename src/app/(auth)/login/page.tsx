import { Suspense } from "react";

import LoginForm, { LoginFormFallback } from "./_components/login-form";

export const metadata = { title: "Giriş yap · Invitorg" };

export default function Page({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
