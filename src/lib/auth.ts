import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt, bearer } from "better-auth/plugins";

import { db } from "@/src/db"; // your drizzle instance
import * as schema from "@/src/db/schema"
 
export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET || "your-super-secret-jwt-key-change-this-in-production",
    plugins: [
        jwt(),
        bearer(),
    ],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            ...schema,
        }
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        }, 
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});