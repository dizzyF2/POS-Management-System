use rusqlite::{params, Connection, Result};

#[derive(Debug, serde::Serialize)]
pub struct Product {
    pub id: i32,
    pub name: String,
    pub price: f64,
    pub barcode: Option<String>,
    pub allow_custom_price: bool,
}

impl Product {
    pub fn create(conn: &Connection, name: &str, price: f64, barcode: Option<&str>, allow_custom_price: bool) -> Result<()> {
        conn.execute(
            "INSERT INTO products (name, price, barcode, allow_custom_price) VALUES (?1, ?2, ?3, ?4)",
            params![name, price, barcode, allow_custom_price as i32],
        )?;
        Ok(())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<Product>> {
        let mut stmt = conn.prepare("SELECT id, name, price, barcode, allow_custom_price FROM products")?;
        let products_iter = stmt.query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                price: row.get(2)?,
                barcode: row.get(3)?,
                allow_custom_price: row.get::<_, i32>(4)? != 0,
            })
        })?;

        let mut products = Vec::new();
        for product in products_iter {
            products.push(product?);
        }
        Ok(products)
    }

    pub fn update(conn: &Connection, id: i32, name: &str, price: f64, barcode: Option<&str>, allow_custom_price: bool) -> Result<()> {
        conn.execute(
            "UPDATE products SET name = ?1, price = ?2, barcode = ?3, allow_custom_price = ?4 WHERE id = ?5",
            params![name, price, barcode, allow_custom_price as i32, id],
        )?;
        Ok(())
    }

    pub fn delete(conn: &Connection, id: i32) -> Result<()> {
        conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;
        Ok(())
    }
}
