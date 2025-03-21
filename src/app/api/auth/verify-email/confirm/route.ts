import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/prisma"

const schema = z.object({
    token: z.string(),
})

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const parsed = schema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 })
        }
        const { token } = parsed.data

        // Find the verification record by token.
        // Note: Since your VerificationToken model uses a composite unique key,
        // we use findFirst() with a where clause on token.
        const verificationRecord = await prisma.verificationToken.findFirst({
            where: { token },
        })

        if (!verificationRecord) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
        }

        // Check if the token has expired
        if (verificationRecord.expires < new Date()) {
            // Clean up expired token(s)
            await prisma.verificationToken.deleteMany({ where: { token } })
            return NextResponse.json({ error: "Token has expired" }, { status: 400 })
        }

        // Update the user record, setting emailVerified to the current date.
        // The relation uses `identifier` which references the user's username.
        await prisma.user.update({
            where: { username: verificationRecord.identifier },
            data: { emailVerified: new Date() },
        })

        // Delete the token to prevent reuse
        await prisma.verificationToken.deleteMany({ where: { token } })

        return NextResponse.json({ message: "Email verified successfully" })
    } catch (error) {
        console.error("Error verifying email:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
