import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {prisma} from "@/prisma"; // Ensure Prisma instance is set up
import bcrypt from "bcryptjs";
import {Role, SubscriptionStatus} from "@prisma/client";

export const {handlers, auth} = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {label: "Username", type: "text", placeholder: "johndoe"},
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials) {
                const {username, password} = credentials as {
                    username: string;
                    password: string;
                };

                const user = await prisma.user.findUnique({
                    where: {username},
                    include: {
                        subscriptions: {
                            where: {
                                status: SubscriptionStatus.ACTIVE
                            },
                            orderBy: {
                                createdAt: "desc"
                            },
                            include: {
                                plan: true
                            }
                        },
                    },
                });

                if (!user) {
                    return null; // User not found
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    return null; // Incorrect password
                }
                // Return user object with role
                return {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    isActive: user.isActive,
                    role: user.role, // Include the role
                    plan: (user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0]) ? user.subscriptions[0].plan : null,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({token, user}) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role || Role.USER; // Default to "user"
                token.plan = (user as any).plan || null;
                token.isActive = (user as any).isActive || false;
            }
            return token;
        },
        async session({session, token}) {
            session.user.id = token.id as string;
            (session.user as any).role = token.role as string; // Add role to session
            (session.user as any).plan = token.plan as any; // Add plan to session
            (session.user as any).isActive = token.isActive as boolean;
            return session;
        },
    },
    pages: {
        signIn: "/sign-in",
        newUser: "/sign-up",
        signOut: "/sign-out",
    }
});
