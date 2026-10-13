import Link from "next/link";
import { redirect } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { auth } from "@/auth";
import {
  ensureReviewCardsSeeded,
  getDueReviewCards,
  getNextDueDate,
} from "@/lib/review";
import { ReviewSession } from "./review-session";

function formatNextDue(date: Date): string {
  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  );
  const timeFormatter = new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays <= 0)
    return `hoy más tarde, a las ${timeFormatter.format(date)}`;
  if (diffDays === 1) return `mañana a las ${timeFormatter.format(date)}`;

  const dateFormatter = new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return dateFormatter.format(date);
}

export default async function ReviewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  await ensureReviewCardsSeeded(userId);
  const { vocab, kanji } = await getDueReviewCards(userId);

  let nextDueLabel: string | null = null;
  if (vocab.length === 0 && kanji.length === 0) {
    const nextDueDate = await getNextDueDate(userId);
    nextDueLabel = nextDueDate ? formatNextDue(nextDueDate) : null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-1 flex items-center gap-2 text-2xl font-bold">
        <RotateCcw className="size-6 text-muted-foreground" />
        Repaso
      </h1>
      <p className="mb-6 text-muted-foreground">
        Repetición espaciada: repasa hoy lo que toca, y el sistema decide cuándo
        te conviene volver a verlo.
      </p>
      <ReviewSession vocab={vocab} kanji={kanji} nextDueLabel={nextDueLabel} />
    </div>
  );
}
