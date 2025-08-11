import Link from "next/link"
import { BookOpen } from "lucide-react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import { SignupForm } from "./sign-up-form"
import { SiteLogo } from "@/src/components/ui/site-logo"
import { auth } from "@/src/lib/auth"

const Page = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if(!!session){
    redirect('/');
  }
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SiteLogo />
            <span className="text-xl font-semibold tracking-tight">StudyRooms</span>
          </div>
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50",
            )}
          >
            <BookOpen className="h-4 w-4" />
            {"Explore rooms"}
          </Link>
        </header>

        {/* Centered sign-up card */}
        <div className="mx-auto max-w-xl">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Join StudyRooms to start collaborating</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
              <p className="mt-6 text-center text-sm text-slate-600">
                {"Already have an account? "}
                <Link
                  href="/sign-in"
                  className="font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800"
                >
                  {"Log in"}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default Page;
