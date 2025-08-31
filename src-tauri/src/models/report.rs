use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct SaleDetail {
    pub product_name: String,
    pub quantity: i32,
    pub employee_name: String,
    pub total_price: f64,
    pub timestamp: String,
}

#[derive(Serialize)]
pub struct SalesReport {
    pub total_sales: f64,
    pub total_transactions: i64,
    pub sales: Vec<SaleDetail>,
}

pub fn get_report(
    conn: &Connection,
    start_date: Option<&str>,
    end_date: Option<&str>,
) -> Result<SalesReport> {
    let start = start_date.unwrap_or("1970-01-01");
    let end = end_date.unwrap_or("9999-12-31");

    // Fetch total sales and transactions
    let mut stmt = conn.prepare(
        "SELECT IFNULL(SUM((price + extra_amount) * quantity), 0) as total_sales,
                COUNT(DISTINCT sale_id) as total_transactions
            FROM sale_items
            JOIN sales ON sale_items.sale_id = sales.id
            WHERE date(sales.timestamp) BETWEEN ?1 AND ?2"
    )?;

    let (total_sales, total_transactions): (f64, i64) =
        stmt.query_row(params![start, end], |row| Ok((row.get(0)?, row.get(1)?)))?;

    // Fetch detailed sales
    let mut stmt_details = conn.prepare(
        "SELECT sale_items.product_name, sale_items.quantity, sales.employee_name, 
                ((sale_items.price + sale_items.extra_amount) * sale_items.quantity) as total_price, sales.timestamp
            FROM sale_items
            JOIN sales ON sale_items.sale_id = sales.id
            WHERE date(sales.timestamp) BETWEEN ?1 AND ?2
            ORDER BY sales.timestamp DESC"
    )?;

    let sales_iter = stmt_details.query_map(params![start, end], |row| {
        Ok(SaleDetail {
            product_name: row.get(0)?,
            quantity: row.get(1)?,
            employee_name: row.get(2)?,
            total_price: row.get(3)?,
            timestamp: row.get(4)?,
        })
    })?;

    let mut sales = Vec::new();
    for sale in sales_iter {
        sales.push(sale?);
    }

    Ok(SalesReport {
        total_sales,
        total_transactions,
        sales,
    })
}