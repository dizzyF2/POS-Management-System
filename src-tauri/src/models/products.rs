use rusqlite::{params, Connection, Result};
use chrono::Utc;

#[derive(Debug, serde::Serialize)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub barcode: String,
}

pub fn create_product_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            barcode TEXT NOT NULL UNIQUE
        )",
        [],
    )?;
    Ok(())
}

pub fn add_product(conn: &Connection, name: &str, price: f64, barcode: Option<&str>) -> Result<usize> {
    let barcode_val = if let Some(bc) = barcode {
        if !bc.trim().is_empty() {
            bc.to_string()
        } else {
            generate_barcode()
        }
    } else {
        generate_barcode()
    };

    conn.execute(
        "INSERT INTO products (name, price, barcode) VALUES (?1, ?2, ?3)",
        params![name, price, barcode_val],
    )
}

fn generate_barcode() -> String {
    let timestamp = Utc::now().timestamp_millis();
    format!("P{}", timestamp)
}

pub fn get_products(conn: &Connection) -> Result<Vec<Product>> {
    let mut stmt = conn.prepare("SELECT id, name, price, barcode FROM products")?;
    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            price: row.get(2)?,
            barcode: row.get(3)?,
        })
    })?;

    let mut products = Vec::new();
    for product in rows {
        products.push(product?);
    }
    Ok(products)
}

pub fn update_product(conn: &Connection, id: i32, name: &str, price: f64, barcode: &str) -> Result<usize> {
    conn.execute(
        "UPDATE products SET name = ?1, price = ?2, barcode = ?3 WHERE id = ?4",
        params![name, price, barcode, id],
    )
}

pub fn delete_product(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])
}