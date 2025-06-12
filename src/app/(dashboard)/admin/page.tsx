'use client';

import {Suspense, useState, useEffect} from "react"
import {UserTable} from "@/components/admin/user-table"
import {Skeleton} from "@/components/ui/skeleton"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";

export default function AdminPage() {
    const [isSchedulerRunning, setIsSchedulerRunning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedulerState = async () => {
            try {
                const response = await fetch("/api/scheduler");
                if (response.ok) {
                    const data = await response.json();
                    setIsSchedulerRunning(data.isEnabled);
                } else {
                    console.error("Failed to fetch scheduler state:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching scheduler state:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedulerState();
    }, []);

    const toggleScheduler = async (checked: boolean) => {
        setIsSchedulerRunning(checked);
        console.log(`Attempting to set news scheduler to ${checked ? 'enabled' : 'disabled'}...`);
        try {
            const response = await fetch("/api/scheduler", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ enable: checked }),
            });

            if (response.ok) {
                console.log(`News scheduler ${checked ? 'enabled' : 'disabled'} successfully!`);
            } else {
                console.error(`Failed to set news scheduler state: ${response.statusText}`);
                setIsSchedulerRunning(!checked); // Revert toggle state on API failure
            }
        } catch (error) {
            console.error("Error setting news scheduler state:", error);
            setIsSchedulerRunning(!checked); // Revert toggle state on network error
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts, view details, and control access.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                    {isLoading ? (
                        <Skeleton className="h-6 w-12" />
                    ) : (
                        <Switch
                            id="news-scheduler"
                            checked={isSchedulerRunning}
                            onCheckedChange={toggleScheduler}
                            disabled={isLoading} // Disable while loading
                        />
                    )}
                    <Label htmlFor="news-scheduler">Toggle News Scraping Scheduler</Label>
                </div>

                <Suspense fallback={<UserTableSkeleton/>}>
                    <UserTable/>
                </Suspense>
            </CardContent>
        </Card>
    )
}

function UserTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]"/>
                <Skeleton className="h-10 w-[200px]"/>
            </div>
            <div className="border rounded-md">
                <Skeleton className="h-[500px] w-full"/>
            </div>
        </div>
    )
}

