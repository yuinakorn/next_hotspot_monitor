import { NextResponse } from 'next/server';
import { getDashboardSummary } from '@/lib/dashboard-data';

export async function GET() {
    try {
        const summary = await getDashboardSummary();
        return NextResponse.json(summary);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch dashboard summary', details: error.message },
            { status: 500 }
        );
    }
}
