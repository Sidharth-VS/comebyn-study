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
    <main className="min-h-screen bg-gradient-to-b from-[#845EC2] to-[#F3C5FF]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">

        {/* Centered login card (preview removed) */}
        <div className="mx-auto max-w-xl">
          <Card className="border-slate-200 shadow-sm bg-slate-50">
            <CardHeader className="justify-items-center">
              <CardTitle className="text-2xl text-[#6d34ca]">Welcome back</CardTitle>
              <CardDescription className="text-[#6d34ca]">Log in to continue studying</CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
              <p className="mt-6 text-center text-sm text-slate-600">
                {"Don't have an account? "}
                <Link
                  href="/sign-up"
                  className="font-medium text-[#6d34ca] underline underline-offset-4 hover:text-[#23084f]"
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