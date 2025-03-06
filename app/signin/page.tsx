import { LoginForm } from "@/components/client/user-signin-signup/signin-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
export default async function LoginPage() {
    const session = await auth()
    if (session) {
        redirect("/dashboard")
    }
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}