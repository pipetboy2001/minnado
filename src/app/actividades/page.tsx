import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getLessonsN5 } from "@/content/loader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ActividadesPage() {
  const session = await auth();
  const lessons = getLessonsN5();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Actividades N5</h1>
          <p className="text-sm text-muted-foreground">
            Hola, {session?.user?.name ?? session?.user?.email}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="outline" type="submit">
            Cerrar sesión
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/actividades/${lesson.id}`}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 text-sm text-muted-foreground">
                <span>{lesson.vocabIds.length} palabras</span>
                <span>{lesson.kanjiIds.length} kanji</span>
                <span>{lesson.grammarIds.length} reglas de gramática</span>
                <span>{lesson.exerciseIds.length} ejercicios</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
