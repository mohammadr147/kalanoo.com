
'use server'; // This action can be called from client components

import pool from '@/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import type { Banner } from '@/types';

/**
 * Fetches banners intended for client-side display.
 * Only active banners are fetched and sorted by order.
 */
export async function fetchBannersClient(): Promise<{ success: boolean; banners?: Banner[]; error?: string }> {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            'SELECT id, title, description, image_url, mobile_image_url, link, `order`, is_active FROM banners WHERE is_active = 1 ORDER BY `order` ASC'
        );

        const banners: Banner[] = rows.map(row => ({
            id: row.id, // id is number from DB
            title: row.title,
            description: row.description,
            image_url: row.image_url,
            mobile_image_url: row.mobile_image_url,
            link: row.link,
            order: row.order,
            is_active: Boolean(row.is_active), // Will always be true here due to WHERE clause
            // created_at and updated_at are not fetched as they are not needed for client display
        }));

        return { success: true, banners };
    } catch (error: any) {
        console.error("Error fetching banners for client from MySQL:", error);
        return { success: false, error: 'خطا در دریافت لیست بنرها از پایگاه داده.' };
    } finally {
        if (connection) connection.release();
    }
}
