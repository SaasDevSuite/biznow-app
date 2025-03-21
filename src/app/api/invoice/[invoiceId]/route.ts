import {auth} from "@/auth";
import {getInvoiceById} from "@/actions/invoice/query";

export async function GET(request: Request, {params}: { params: Promise<{ invoiceId: string }> }) {
    const session = await auth();

    if (!session) {
        return new Response(JSON.stringify({error: "Unauthorized"}), {
            status: 401,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    try {
        const {invoiceId} = await params
        const plan = await getInvoiceById(invoiceId)
        return new Response(JSON.stringify(plan), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({error: "Failed to fetch invoice from ID"}), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}