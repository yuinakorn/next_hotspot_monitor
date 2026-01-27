import { NextResponse } from 'next/server';
import { getInactiveUsers } from '@/lib/dashboard-data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);

    try {
        const users = await getInactiveUsers(days);
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Failed to fetch inactive users', details: error.message },
            { status: 500 }
        );
    }
}
