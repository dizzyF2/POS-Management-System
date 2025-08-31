use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SaleReport {
    pub id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub employee_name: String,
    pub total: f64,
    pub timestamp: String,
}

// Start a sale: we insert both employee_id and employee_name (snapshot)
pub fn start_sale(conn: &Connection, employee_id: i32, employee_name: &str) -> Result<i64> {
    conn.execute(
        "INSERT INTO sales (employee_id, employee_name, total) VALUES (?1, ?2, 0)",
        params![employee_id, employee_name],
    )?;
    Ok(conn.last_insert_rowid())
}

// Add an item: store both product_id and product_name (snapshot)
pub fn add_sale_item(
    conn: &Connection,
    sale_id: i64,
    product_id: i32,
    quantity: i32,
    price: f64,
    extra_amount: f64,
) -> Result<()> {
    let mut stmt = conn.prepare("SELECT name FROM products WHERE id = ?1")?;
    let product_name: String = stmt.query_row(params![product_id], |row| row.get(0))?;

    conn.execute(
        "INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price, extra_amount) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![sale_id, product_id, product_name, quantity, price, extra_amount],
    )?;
    Ok(())
}

// Update the sale total based on sum of items
pub fn update_sale_total(conn: &Connection, sale_id: i64) -> Result<()> {
    let mut stmt = conn.prepare(
        "SELECT SUM(quantity * (price + extra_amount)) FROM sale_items WHERE sale_id = ?1"
    )?;
    let total: f64 = stmt.query_row(params![sale_id], |row| row.get(0))?;

    conn.execute(
        "UPDATE sales SET total = ?1 WHERE id = ?2",
        params![total, sale_id],
    )?;
    Ok(())
}

// Fetch all sales for report
pub fn get_all_sales(conn: &Connection) -> Result<Vec<SaleReport>> {
    let mut stmt = conn.prepare(
        "
        SELECT 
            si.id,
            si.product_name,
            si.quantity,
            s.employee_name,
            (si.price * si.quantity) as total,
            s.timestamp
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        ORDER BY s.timestamp DESC
        "
    )?;

    let sales = stmt.query_map([], |row| {
        Ok(SaleReport {
            id: row.get(0)?,
            product_name: row.get(1)?,
            quantity: row.get(2)?,
            employee_name: row.get(3)?,
            total: row.get(4)?,
            timestamp: row.get(5)?,
        })
    })?;

    Ok(sales.filter_map(Result::ok).collect())
}