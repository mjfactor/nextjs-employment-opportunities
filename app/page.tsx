import LandingPage from "@/components/landing-page/landing-page-ui";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Home() {
  const session = await auth()
  if (session) {
    redirect("/dashboard")
  }
  return <div>
    <LandingPage />
  </div>
}