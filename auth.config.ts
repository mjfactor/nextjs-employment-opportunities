import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
// Notice this is only an object, not a full Auth.js instance
export default {
    providers: [
        Google,
        Credentials({
            
        })
    ],
} satisfies NextAuthConfig