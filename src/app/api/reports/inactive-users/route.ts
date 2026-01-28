import { getInactiveUsers } from '@/lib/dashboard-data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const inactiveUsers = await getInactiveUsers(90);

        const csvHeader = 'Username,First Name,Last Name,Company,Last Login,Days Inactive\n';
        const csvRows = inactiveUsers.map(user => {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : 'Never';
            return `"${user.username}","${user.firstname || ''}","${user.lastname || ''}","${user.company || ''}","${lastLogin}","${user.daysInactive || ''}"`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="inactive-users-report.csv"',
            },
        });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
