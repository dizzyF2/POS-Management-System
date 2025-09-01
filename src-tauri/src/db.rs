use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub fn init_db(app: &tauri::AppHandle) -> Result<Connection> {
    let path: PathBuf = app
        .path()
        .resolve("restaurant.db", BaseDirectory::AppData)
        .unwrap();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }

    let conn = Connection::open(path)?;

    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            barcode TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            total REAL NOT NULL DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            extra_amount REAL NOT NULL DEFAULT 0,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
        );
        ",
    )?;

    Ok(conn)
}

pub fn establish_connection(app: &tauri::AppHandle) -> Result<Connection, rusqlite::Error> {
    let path: PathBuf = app
        .path()
        .resolve("restaurant.db", BaseDirectory::AppData)
        .unwrap();

    Connection::open(path)
}
