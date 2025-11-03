import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { StudyFlashcardsView } from "./StudyFlashcardsView";

export default async function StudyFlashcardsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <StudyFlashcardsView />;
}
