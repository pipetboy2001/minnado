import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
