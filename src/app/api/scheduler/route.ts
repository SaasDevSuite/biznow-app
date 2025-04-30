// src/app/api/scheduler/route.ts
import { NextResponse } from 'next/server';
import { startScheduler } from '../../../../cron';

// Store job reference to prevent garbage collection
let schedulerJob: any = null;

export async function GET() {
    if (!schedulerJob) {
        schedulerJob = startScheduler();
        return NextResponse.json({ message: 'Scheduler started successfully' }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'Scheduler already running' }, { status: 200 });
    }
}

// You could add other HTTP methods if needed
export async function POST() {
    return NextResponse.json({ message: 'Method not supported' }, { status: 405 });
}