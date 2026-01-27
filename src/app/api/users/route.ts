import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, UserManagementData } from '@/lib/dashboard-data';

export async function GET() {
    try {
        const users = await getAllUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const userData: UserManagementData = {
            username: body.username,
            password: body.password,
            firstname: body.firstname,
            lastname: body.lastname,
            company: body.company,
            srvid: body.srvid ? Number(body.srvid) : null,
        };

        if (!userData.username || !userData.password) {
            return NextResponse.json({ error: 'Username and Password are required' }, { status: 400 });
        }

        await createUser(userData);
        return NextResponse.json({ success: true, message: 'User created successfully' });
    } catch (error: any) {
        // Handle duplicate entry error specifically if possible, otherwise generic
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
