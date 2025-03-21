'use client'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {getUserAccounts} from "@/actions/user/query";
import {JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState} from "react";

export function UserAccounts({userId}: { userId: string }) {
    const [accounts, setAccounts] = useState<any>([])

    useEffect(() => {
        const fetchAccounts = async () => {
            const accounts = await getUserAccounts(userId)
            setAccounts(accounts)
        }
        fetchAccounts()
    }, [userId])

    if (accounts.length === 0) {
        return <p className="text-muted-foreground">No linked accounts found.</p>
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Provider</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Provider ID</TableHead>
                        <TableHead>Expires</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {accounts.map((account: {
                        id: Key | null | undefined;
                        provider: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
                        type: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
                        providerAccountId: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined;
                        expires_at: number;
                    }) => (
                        <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.provider}</TableCell>
                            <TableCell>{account.type}</TableCell>
                            <TableCell>{account.providerAccountId}</TableCell>
                            <TableCell>
                                {account.expires_at ? new Date(account.expires_at * 1000).toLocaleDateString() : "—"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

