"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

export default function NotAuthenticated() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/sign-in");
        }, 3000); // Redirect after 3 seconds

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
                <p>Please sign in to continue. Redirecting to the sign-in page shortly...</p>
            </div>
        </div>
    );
}
