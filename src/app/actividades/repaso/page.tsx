import Link from "next/link";
import { auth } from "@/auth";
import { ensureReviewCardsSeeded, getDueReviewCards } from "@/lib/review";
import { ReviewSession } from "./review-session";

export default async function ReviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  await ensureReviewCardsSeeded(userId);
  const { vocab, kanji } = await getDueReviewCards(userId);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 p-6">
      <Link
        href="/actividades"
        className="text-sm text-muted-foreground underline"
      >
        ← Volver a actividades
      </Link>
      <h1 className="mt-2 mb-1 text-2xl font-bold">Repaso</h1>
      <p className="mb-6 text-muted-foreground">
        Repetición espaciada: repasa hoy lo que toca, y el sistema decide cuándo
        te conviene volver a verlo.
      </p>
      <ReviewSession vocab={vocab} kanji={kanji} />
    </div>
  );
}
