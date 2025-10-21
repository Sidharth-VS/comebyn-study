import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
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
            <span className="text-xl font-semibold tracking-tight">ComeByN Study</span>
          </div>
        </header>

        {/* Centered login card (preview removed) */}
        <div className="mx-auto max-w-xl">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="justify-items-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Log in to continue studying</CardDescription>
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