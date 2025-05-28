
'use server';

import pool from '@/lib/mysql';
import type { RowDataPacket } from 'mysql2';
import type { Product } from '@/types';

interface FetchProductsParams {
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'created_at' | 'name';
  sortOrder?: 'ASC' | 'DESC';
  categoryId?: string;
}

const productQueryFields = `
    p.id, p.name, p.description, p.price, p.installment_price, p.check_price, 
    p.original_price, p.discount_percent, p.image_url, p.images, 
    p.category_id, c.name as category_name, p.stock, p.is_featured, 
    p.is_new, p.is_active, p.created_at, p.updated_at
`;

// Helper to parse JSON images string
function parseProductImages(imagesJson: string | null | undefined): string[] {
    if (!imagesJson) return [];
    try {
        const parsed = JSON.parse(imagesJson);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        // console.error(`Failed to parse 'images' field: ${imagesJson}`, error);
        return [];
    }
}

export async function fetchAllActiveProductsClient(
  params: FetchProductsParams = {}
): Promise<{ products?: Product[]; error?: string; total?: number }> {
  const { limit = 8, offset = 0, sortBy = 'created_at', sortOrder = 'DESC', categoryId } = params;
  let connection;
  try {
    connection = await pool.getConnection();
    let query = `
        SELECT ${productQueryFields}
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
    `;
    const queryParams: (string | number)[] = [];

    if (categoryId) {
        query += ` AND p.category_id = ?`;
        queryParams.push(categoryId);
    }

    const validSortBy = ['price', 'created_at', 'name'].includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC';
    query += ` ORDER BY p.${validSortBy} ${validSortOrder}`;
    
    // For total count before limit/offset
    const countQuery = query.replace(`SELECT ${productQueryFields}`, 'SELECT COUNT(DISTINCT p.id) as total');
    const [countRows] = await connection.query<RowDataPacket[]>(countQuery, queryParams);
    const total = countRows[0]?.total || 0;


    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
    
    const [rows] = await connection.query<RowDataPacket[]>(query, queryParams);
    
    const products: Product[] = rows.map(row => ({
      id: String(row.id),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      installment_price: row.installment_price ? parseFloat(row.installment_price) : null,
      check_price: row.check_price ? parseFloat(row.check_price) : null,
      original_price: row.original_price ? parseFloat(row.original_price) : null,
      discount_percent: row.discount_percent ? parseInt(row.discount_percent, 10) : null,
      image_url: row.image_url,
      images: parseProductImages(row.images),
      category_id: row.category_id ? String(row.category_id) : null,
      category_name: row.category_name,
      stock: parseInt(row.stock, 10),
      is_featured: Boolean(row.is_featured),
      is_new: Boolean(row.is_new),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    return { products, total };
  } catch (error: any) {
    console.error('Error in fetchAllActiveProductsClient:', error);
    return { error: 'خطا در دریافت لیست محصولات.' };
  } finally {
    if (connection) connection.release();
  }
}

export async function fetchFeaturedProductsClient(
  params: { limit?: number } = {}
): Promise<{ products?: Product[]; error?: string }> {
  const { limit = 4 } = params;
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT ${productQueryFields}
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = 1 AND p.is_featured = 1
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );
    const products: Product[] = rows.map(row => ({
      id: String(row.id),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      installment_price: row.installment_price ? parseFloat(row.installment_price) : null,
      check_price: row.check_price ? parseFloat(row.check_price) : null,
      original_price: row.original_price ? parseFloat(row.original_price) : null,
      discount_percent: row.discount_percent ? parseInt(row.discount_percent, 10) : null,
      image_url: row.image_url,
      images: parseProductImages(row.images),
      category_id: row.category_id ? String(row.category_id) : null,
      category_name: row.category_name,
      stock: parseInt(row.stock, 10),
      is_featured: Boolean(row.is_featured),
      is_new: Boolean(row.is_new),
      is_active: Boolean(row.is_active),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    return { products };
  } catch (error: any) {
    console.error('Error in fetchFeaturedProductsClient:', error);
    return { error: 'خطا در دریافت محصولات ویژه.' };
  } finally {
    if (connection) connection.release();
  }
}
