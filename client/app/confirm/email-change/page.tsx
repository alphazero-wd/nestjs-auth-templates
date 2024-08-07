import { getUser } from "@/features/users/actions";
import { confirmEmail } from "@/features/auth/actions/confirm-email";
import { redirect } from "next/navigation";
import { MailCheck, MailX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import Link from "next/link";
import { confirmEmailChange } from "./confirm";
import { ConfirmEmailChangeClient } from "./client";

interface ConfirmEmailChangeParams {
  searchParams: {
    token?: string;
    type?: "old" | "new";
  };
}

export default async function ConfirmEmailChange({
  searchParams: { token, type },
}: ConfirmEmailChangeParams) {
  const user = await getUser();
  if (!user) redirect("/");
  if (!token || !type || !(["old", "new"] as const).includes(type))
    redirect("/");
  const { success, message } = await confirmEmailChange(token, type);

  const Icon = !success ? MailX : MailCheck;
  return (
    <>
      <main className="flex justify-center items-center h-full w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-md container text-center space-y-4">
          <div
            className={cn(
              !success
                ? "border-red-700 text-red-700 dark:border-red-200 dark:text-red-200"
                : "border-green-700 text-green-700 dark:border-green-200 dark:text-green-200",
              "rounded-full flex items-center justify-center mx-auto w-12 h-12 border-2"
            )}
          >
            <Icon className="w-6 h-6 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {!success
              ? "Failed to confirm email"
              : "Email confirmed successfully"}
          </h2>
          <p className="text-muted-foreground text-lg">{message}</p>
          <Button asChild className="w-fit">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </main>
      <ConfirmEmailChangeClient success={success} />
    </>
  );
}
