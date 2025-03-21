import {NextResponse} from "next/server"
import {z} from "zod"
import {prisma} from "@/prisma"
import crypto from "crypto"

const schema = z.object({
    email: z.string().email(),
})

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const parsed = schema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({error: "Invalid email"}, {status: 400})
        }
        const {email} = parsed.data

        // Find the user by email
        const user = await prisma.user.findUnique({where: {email}})

        if (user) {
            // Generate a secure token and expiration (e.g., 1 hour from now)
            const token = crypto.randomBytes(32).toString("hex")
            const expires = new Date(Date.now() + 3600000) // 1 hour in the future

            // Save the token in the database
            await prisma.passwordResetToken.create({
                data: {
                    token,
                    userId: user.id,
                    expires,
                },
            })

            // Build a reset link (adjust the URL to your domain and route)
            const resetLink = `https://yourdomain.com/auth/reset-password/${token}`
            console.log("Reset link:", resetLink)

            // TODO: Send the reset link via email using your email provider
        }

        // Always return the same response to avoid exposing if a user exists
        return NextResponse.json({
            message:
                "If an account exists with that email, we've sent a password reset link.",
        })
    } catch (error) {
        console.error("Error in reset password:", error)
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        )
    }
}
