import {NextResponse} from "next/server";
import {z} from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {prisma} from "@/prisma"; // Ensure your prisma instance is set up
import {sendEmail} from "@/service/email-service";

// Define the same schema as on the client
const formSchema = z.object({
    username: z.string().min(3, {
        message: "Username must be at least 3 characters.",
    }),
    email: z
        .string()
        .email({message: "Please enter a valid email address."})
        .optional()
        .or(z.literal("")),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});

export async function POST(request: Request) {
    try {
        // Parse and validate the incoming data
        const data = await request.json();
        const parsed = formSchema.safeParse(data);
        if (!parsed.success) {
            return NextResponse.json(
                {error: parsed.error.errors},
                {status: 400}
            );
        }

        const {username, email, password} = parsed.data;

        // Check if the username already exists
        const existingUserByUsername = await prisma.user.findUnique({
            where: {username},
        });
        if (existingUserByUsername) {
            return NextResponse.json(
                {error: "Username already exists."},
                {status: 400}
            );
        }

        // If an email is provided, check if it already exists
        if (email && email.trim() !== "") {
            const existingUserByEmail = await prisma.user.findUnique({
                where: {email},
            });
            if (existingUserByEmail) {
                return NextResponse.json(
                    {error: "Email already exists."},
                    {status: 400}
                );
            }
        }

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user record in the database
        const newUser = await prisma.user.create({
            data: {
                username,
                email: email && email.trim() !== "" ? email : null,
                password: hashedPassword,
            },
        });

        // Create a corresponding account record for credential-based signup
        await prisma.account.create({
            data: {
                userId: newUser.id,
                type: "credential", // Indicates that this is a credential-based account
                provider: "credential", // The provider for this account is "credential"
                providerAccountId: newUser.id, // Using the user's id as the unique identifier
            },
        });

        // If an email was provided, generate a verification token and send a verification email
        if (newUser.email) {
            // Generate a random token
            const token = crypto.randomBytes(32).toString("hex");
            // Set expiration time (e.g., 24 hours from now)
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            // Create a verification token record in the database.
            // Note: The VerificationToken model uses the user's username as the identifier.
            await prisma.verificationToken.create({
                data: {
                    identifier: newUser.username,
                    token: token,
                    expires: expires,
                },
            });

            // Build a verification link. Use an environment variable for your app URL.
            const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify/email/${token}`;

            await sendEmail({
                templateName: "auth/verify-email",
                recipientEmail: newUser.email,
                replacements: {
                    name: newUser.username,
                    verifyLink: verificationLink
                },
            });
        }

        return NextResponse.json(
            {message: "User created successfully", user: newUser},
            {status: 201}
        );
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        );
    }
}
