import fs from "fs";
import path from "path";
import {promisify} from "util";
import {Resend} from "resend";

const readFile = promisify(fs.readFile);
const resend = new Resend(process.env.RESEND_API_KEY);

const NO_REPLY_EMAIL = process.env.NO_REPLY_EMAIL || "SaaS Dev Suite <noreply@saasdevsuite.com>";
const EMAIL_TEMPLATES_DIR = path.join(process.cwd(), "emails/templates");
const EMAIL_CONTENT_DIR = path.join(process.cwd(), "emails");

const loadTemplate = async (filePath: string) => {
    try {
        return await readFile(filePath, "utf8");
    } catch (error) {
        console.error(`Error loading file: ${filePath}`, error);
        throw new Error(`Template not found: ${filePath}`);
    }
};

export const sendEmail = async ({
                                    templateName,
                                    replacements = {},
                                    senderEmail,
                                    recipientEmail,
                                    subject,
                                }: {
    templateName: string;
    replacements?: Record<string, string>;
    senderEmail?: string;
    recipientEmail: string;
    subject?: string;
}) => {
    try {
        const baseTemplate = await loadTemplate(path.join(EMAIL_TEMPLATES_DIR, "base.html"));
        const header = await loadTemplate(path.join(EMAIL_TEMPLATES_DIR, "header.html"));
        const footer = await loadTemplate(path.join(EMAIL_TEMPLATES_DIR, "footer.html"));
        let content = await loadTemplate(path.join(EMAIL_CONTENT_DIR, `${templateName}.html`));

        // Replace placeholders in content
        Object.keys(replacements).forEach((key) => {
            content = content.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
        });

        // Assemble the final email by injecting header, content, and footer
        const emailBody = baseTemplate
            .replace("{{header}}", header.replace("{{headerText}}", "Welcome to Our Service"))
            .replace("{{content}}", content)
            .replace("{{footer}}", footer);

        // Send email using Resend
        const res = await resend.emails.send({
            from: senderEmail || NO_REPLY_EMAIL,
            to: recipientEmail,
            subject: subject || `Your ${templateName} Email`,
            html: emailBody,
        });

        if (res.error) {
            console.error("Error sending email:", res.error);
            throw new Error(`${res.error}`);
        } else {
            console.log("Email sent successfully:", res);
        }

    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};