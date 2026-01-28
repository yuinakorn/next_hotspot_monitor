'use server';

import { getTopDataUsers, TopDataUser } from '@/lib/dashboard-data';

export async function getTopUsers(limit: number = 50): Promise<TopDataUser[]> {
    try {
        const users = await getTopDataUsers(limit);
        return users;
    } catch (error) {
        console.error('Failed to fetch top users:', error);
        return [];
    }
}
