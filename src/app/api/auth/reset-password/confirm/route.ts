import {NextResponse} from "next/server"
import {z} from "zod"
import {prisma} from "@/prisma"
import bcrypt from "bcryptjs"

const schema = z.object({
    token: z.string(),
    newPassword: z.string().min(8, {message: "Password must be at least 8 characters long"}),
})

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const parsed = schema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({error: "Invalid data"}, {status: 400})
        }
        const {token, newPassword} = parsed.data

        // Look up the token in the database
        const resetTokenRecord = await prisma.passwordResetToken.findUnique({
            where: {token},
        })

        if (!resetTokenRecord) {
            return NextResponse.json({error: "Invalid or expired token"}, {status: 400})
        }

        // Check if the token has expired
        if (resetTokenRecord.expires < new Date()) {
            await prisma.passwordResetToken.delete({
                where: {token},
            })
            return NextResponse.json({error: "Token has expired"}, {status: 400})
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update the user's password in the database
        await prisma.user.update({
            where: {id: resetTokenRecord.userId},
            data: {password: hashedPassword},
        })

        // Delete the token so it cannot be reused
        await prisma.passwordResetToken.delete({
            where: {token},
        })

        return NextResponse.json({message: "Password reset successful"})
    } catch (error) {
        console.error("Error resetting password:", error)
        return NextResponse.json({error: "Internal server error"}, {status: 500})
    }
}
