import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { FlashcardLibraryView } from "./FlashcardLibraryView";

export default async function FlashcardLibraryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <FlashcardLibraryView />;
}
