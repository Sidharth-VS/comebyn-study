import { redirect } from "next/navigation";
import { headers } from "next/headers";

import HomeView from "./HomeView";
import { auth } from "../lib/auth";

const Page = async() => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    redirect('/sign-in');
  }
  return(
    <HomeView userId={session.user.id}/>
  )
}

export default Page;