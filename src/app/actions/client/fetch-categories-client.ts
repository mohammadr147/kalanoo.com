
'use server';

import pool from '@/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import type { Category } from '@/types';

interface FetchCategoriesParams {
  limit?: number;
  parentId?: string | null; // To fetch subcategories or top-level categories
  sortBy?: 'name' | 'order';
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Fetches active categories for client-side display.
 */
export async function fetchActiveCategoriesClient(
  params: FetchCategoriesParams = {}
): Promise<{ categories?: Category[]; error?: string }> {
  const { limit = 6, parentId = null, sortBy = 'order', sortOrder = 'ASC' } = params;
  let connection;

  try {
    connection = await pool.getConnection();
    let query = `
        SELECT id, name, slug, description, image_url, parent_id, \`order\`, is_active 
        FROM categories 
        WHERE is_active = 1
    `;
    const queryParams: (string | number | null)[] = [];

    if (parentId !== undefined) { // Allows fetching top-level (parentId IS NULL) or subcategories
        query += parentId === null ? ` AND parent_id IS NULL` : ` AND parent_id = ?`;
        if (parentId !== null) queryParams.push(parentId);
    }
    
    const validSortBy = ['name', 'order'].includes(sortBy) ? sortBy : 'order';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'ASC';
    query += ` ORDER BY \`${validSortBy}\` ${validSortOrder}`; // Ensured `order` is backticked

    if (limit > 0) {
        query += ` LIMIT ?`;
        queryParams.push(limit);
    }

    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);

    const categories: Category[] = rows.map(row => ({
      id: String(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description,
      image_url: row.image_url,
      parent_id: row.parent_id ? String(row.parent_id) : null,
      order: row.order,
      is_active: Boolean(row.is_active),
    }));

    return { categories };
  } catch (error: any) {
    console.error("Error in fetchActiveCategoriesClient:", error);
    return { error: 'خطا در دریافت لیست دسته‌بندی‌ها.' };
  } finally {
    if (connection) connection.release();
  }
}
