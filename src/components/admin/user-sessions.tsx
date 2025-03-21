"use client"

'use client'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Button} from "@/components/ui/button"
import {X} from "lucide-react"
import {getUserSessions} from "@/actions/user/query";
import {useEffect, useState} from "react";

export function UserSessions({userId}: { userId: string }) {
    const [sessions, setSessions] = useState<any>([])

    useEffect(() => {
        const fetchSessions = async () => {
            const sessions = await getUserSessions(userId)
            setSessions(sessions)
        }
        fetchSessions()
    }, [userId])

    if (sessions.length === 0) {
        return <p className="text-muted-foreground">No active sessions found.</p>
    }

    const handleRevokeSession = (sessionId: string) => {
        // In a real app, you would implement a server action to revoke the session
        console.log(`Revoking session ${sessionId}`)
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions
                        .map((session: { id: string; sessionToken: string; expires: string | number | Date; }) => (
                            <TableRow key={session.id}>
                                <TableCell className="font-medium">{session.sessionToken.substring(0, 8)}...</TableCell>
                                <TableCell>{new Date(session.expires).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)}>
                                        <X className="h-4 w-4"/>
                                        <span className="sr-only">Revoke</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}

