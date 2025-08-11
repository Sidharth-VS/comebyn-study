import Link from "next/link"
import { BookOpen } from "lucide-react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { cn } from "@/src/lib/utils"
import { LoginForm } from "./sign-in-form"
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

        {/* Centered login card (preview removed) */}
        <div className="mx-auto max-w-xl">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Log in to continue to StudyRooms</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <p className="mt-6 text-center text-sm text-slate-600">
                {"Don't have an account? "}
                <Link
                  href="/sign-up"
                  className="font-medium text-sky-700 underline underline-offset-4 hover:text-sky-800"
                >
                  {"Sign up"}
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