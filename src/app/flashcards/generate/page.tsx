import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { GenerateFlashcardsView } from "./GenerateFlashcardsView";

export default async function GenerateFlashcardsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <GenerateFlashcardsView />;
}
