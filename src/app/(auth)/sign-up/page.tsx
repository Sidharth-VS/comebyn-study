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
    <main className="min-h-screen bg-gradient-to-br bg-[#efeee5] py-15">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Centered sign-up card */}
        <div className="mx-auto max-w-xl">
          <Card className="border-gray-100 shadow-lg bg-[#f9f8f0]">
            <CardHeader className="justify-items-center">
              <CardTitle className="text-2xl text-[#1F2937]">ComeByN Study</CardTitle>
              <CardDescription className="text-gray-600">Join to start collaborating</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
              <p className="mt-6 text-center text-sm text-gray-600">
                {"Already have an account? "}
                <Link
                  href="/sign-in"
                  className="font-medium text-[#7C3AED] underline underline-offset-4 hover:text-[#6D28D9]"
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
