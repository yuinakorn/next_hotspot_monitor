import { NextRequest, NextResponse } from 'next/server';
import { updateUser, deleteUser, UserManagementData } from '@/lib/dashboard-data';

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        // Await the params object (New in Next.js 15, likely also in 16 if following suit)
        const { username } = await context.params;
        const body = await request.json();

        const userData: Partial<UserManagementData> = {
            firstname: body.firstname,
            lastname: body.lastname,
            company: body.company,
            srvid: body.srvid !== undefined ? Number(body.srvid) : undefined,
            password: body.password // Optional
        };

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        await updateUser(username, userData);
        return NextResponse.json({ success: true, message: 'User updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await context.params;

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        await deleteUser(username);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
