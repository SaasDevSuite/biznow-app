'use client';

import { useEffect, useState, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SchedulerPage() {
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
                <CardTitle>News Scraping Scheduler</CardTitle>
                <CardDescription>
                    Control the automatic news scraping and processing tasks.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Scheduler Status</h3>
                        <p className="text-sm text-muted-foreground">
                            {isSchedulerRunning ? (
                                "The news scraping scheduler is currently active and running every 5 minutes."
                            ) : (
                                "The news scraping scheduler is currently paused. No new scraping tasks will be initiated."
                            )}
                        </p>
                        <div className="flex items-center space-x-2 mt-4">
                            {isLoading ? (
                                <Skeleton className="h-6 w-12" />
                            ) : (
                                <Switch
                                    id="news-scheduler-toggle"
                                    checked={isSchedulerRunning}
                                    onCheckedChange={toggleScheduler}
                                    disabled={isLoading}
                                />
                            )}
                            <Label htmlFor="news-scheduler-toggle">{isSchedulerRunning ? "Scheduler ON" : "Scheduler OFF"}</Label>
                        </div>
                    </div>

                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-medium">Scheduler Information</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            This scheduler automatically fetches and processes news articles from configured sources. 
                            The scraping job runs periodically to ensure the latest news data is available in your system.
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Frequency: The scraper runs every hour.</li>
                            <li>Data Flow: Scraped articles are processed for categorization and sentiment analysis.</li>
                            <li>Cache Invalidation: Processing new data invalidates the existing news cache to ensure freshness.</li>
                            <li>Dependencies: Requires active connection to external news sources and your database.</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
