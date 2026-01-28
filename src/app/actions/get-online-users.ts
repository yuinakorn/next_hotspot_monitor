'use server';

import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface OnlineUserDetail {
    username: string;
    framedipaddress: string;
    mac_address: string;
    started_at: string;
    nas_ip: string;
    download_mb: number;
    upload_mb: number;
    session_time: string;
}

export async function getOnlineUsersDetails(): Promise<OnlineUserDetail[]> {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query<RowDataPacket[]>(`
            SELECT 
                username,
                framedipaddress,
                callingstationid as mac_address,
                nasipaddress as nas_ip,
                acctstarttime as started_at,
                acctinputoctets as upload_bytes,
                acctoutputoctets as download_bytes,
                TIMEDIFF(NOW(), acctstarttime) as session_time
            FROM radacct
            WHERE acctstoptime IS NULL
            ORDER BY acctstarttime DESC
        `);

        return rows.map((row: any) => ({
            username: row.username,
            framedipaddress: row.framedipaddress,
            mac_address: row.mac_address,
            nas_ip: row.nas_ip,
            started_at: row.started_at, // You might want to format this client-side
            download_mb: Number((row.download_bytes / 1048576).toFixed(2)),
            upload_mb: Number((row.upload_bytes / 1048576).toFixed(2)),
            session_time: row.session_time
        }));
    } finally {
        connection.release();
    }
}
