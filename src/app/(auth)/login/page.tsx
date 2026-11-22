import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = { title: "Giriş yap · Invitorg" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      {/* LoginForm useSearchParams kullanıyor; cacheComponents için Suspense gerekli. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
