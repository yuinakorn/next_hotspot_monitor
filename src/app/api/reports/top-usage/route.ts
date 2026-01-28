import { getTopDataUsers } from '@/lib/dashboard-data';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get top 50 users for the report
        const topUsers = await getTopDataUsers(50);

        const csvHeader = 'Username,First Name,Last Name,Total Download (GB),Total Upload (GB),Total Usage (GB)\n';
        const csvRows = topUsers.map(user => {
            return `"${user.username}","${user.firstname || ''}","${user.lastname || ''}","${user.totalDownload}","${user.totalUpload}","${user.totalUsage}"`;
        }).join('\n');

        const csvContent = csvHeader + csvRows;

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="top-data-usage-report.csv"',
            },
        });
    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
