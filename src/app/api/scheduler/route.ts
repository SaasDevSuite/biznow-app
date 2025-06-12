import { NextResponse } from 'next/server';
import { startNewsScheduler, stopNewsScheduler } from '../../../../cron';
import fs from 'fs';
import path from 'path';

const SCHEDULER_STATE_FILE = path.resolve(process.cwd(), 'scheduler_state.json');

// Utility function to read scheduler state
const readSchedulerState = (): boolean => {
    try {
        if (fs.existsSync(SCHEDULER_STATE_FILE)) {
            const state = JSON.parse(fs.readFileSync(SCHEDULER_STATE_FILE, 'utf8'));
            return state.isEnabled;
        }
    } catch (error) {
        console.error("Error reading scheduler state file in API:", error);
    }
    return false; // Default to disabled if file not found or error
};

// Utility function to write scheduler state
const writeSchedulerState = (isEnabled: boolean): void => {
    try {
        fs.writeFileSync(SCHEDULER_STATE_FILE, JSON.stringify({ isEnabled }), 'utf8');
    } catch (error) {
        console.error("Error writing scheduler state file in API:", error);
    }
};

export async function GET() {
    const isEnabled = readSchedulerState();
    return NextResponse.json({ isEnabled }, { status: 200 });
}

export async function POST(request: Request) {
    try {
        const { enable } = await request.json();
        if (typeof enable !== 'boolean') {
            return NextResponse.json({ message: 'Invalid request body. Expected { enable: boolean }' }, { status: 400 });
        }

        writeSchedulerState(enable);

        if (enable) {
            startNewsScheduler();
        } else {
            stopNewsScheduler();
        }

        return NextResponse.json({ message: `Scheduler set to ${enable ? 'enabled' : 'disabled'}` }, { status: 200 });
    } catch (error) {
        console.error("Error processing POST request:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}