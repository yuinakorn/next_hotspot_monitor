import { NextResponse } from 'next/server';
import { getLoginTrends } from '@/lib/dashboard-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    try {
        const trends = await getLoginTrends(days);
        return NextResponse.json(trends);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch login trends', details: error.message },
            { status: 500 }
        );
    }
}
