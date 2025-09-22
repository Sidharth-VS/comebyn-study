import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/src/lib/auth";
import { SummarizeView } from "./SummarizeView";

const Page = async() => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    redirect('/sign-in');
  }
  return(
    <SummarizeView />
  )
}

export default Page;