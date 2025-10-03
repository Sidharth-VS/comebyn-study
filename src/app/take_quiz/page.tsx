import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/src/lib/auth";
import { TakeQuizView } from "./TakeQuizView";

const Page = async() => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    redirect('/sign-in');
  }
  return(
    <TakeQuizView />
  )
}

export default Page;