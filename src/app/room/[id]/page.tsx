import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { RoomView } from "./RoomView";
import { auth } from "@/src/lib/auth";

const Page = async() => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if(!session){
    redirect('/sign-in');
  }
  return(
    <RoomView />
  )
}

export default Page;