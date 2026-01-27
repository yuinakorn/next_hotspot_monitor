import { NextResponse } from 'next/server';
import { getServices } from '@/lib/dashboard-data';

export async function GET() {
    try {
        const services = await getServices();
        return NextResponse.json(services);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
