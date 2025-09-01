mod db;
mod models;

use db::establish_connection;

use db::init_db;
use models::admin::{create_admin_table, add_admin, validate_admin, update_admin, verify_admin_password};
use models::employee::{
    create_employee_table, add_employee, get_employees, update_employee, verify_employee, delete_employee, Employee,
};
use models::products::{
    create_product_table, add_product, get_products, update_product, delete_product, Product,
};
use models::sale::{start_sale, add_sale_item, update_sale_total, get_all_sales, SaleReport};
use models::report::{get_report, SalesReport};


// ---------------- ADMIN COMMANDS ----------------
#[tauri::command]
fn setup_admin(app: tauri::AppHandle) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    create_admin_table(&conn).map_err(|e| e.to_string())?;

    let count: i32 = conn
        .query_row("SELECT COUNT(*) FROM admins", [], |row| row.get(0))
        .unwrap_or(0);

    if count == 0 {
        add_admin(&conn, "admin", "admin").ok();
    }

    Ok(())
}

#[tauri::command]
fn login_admin(app: tauri::AppHandle, name: String, password: String) -> Result<bool, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    validate_admin(&conn, &name, &password).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_admin_cmd(
    app: tauri::AppHandle,
    old_password: String,
    new_name: String,
    new_password: String,
) -> Result<bool, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    update_admin(&conn, &old_password, &new_name, &new_password)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn verify_old_password_cmd(app: tauri::AppHandle, old_password: String) -> Result<bool, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    verify_admin_password(&conn, &old_password).map_err(|e| e.to_string())
}

#[tauri::command]
fn reset_admin(app: tauri::AppHandle) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    conn.execute("UPDATE admins SET name='admin', password='1234' WHERE id=1", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_admin_name(app: tauri::AppHandle) -> Result<String, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    let name: String = conn
        .query_row("SELECT name FROM admins WHERE id = 1", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(name)
}


// -------- EMPLOYEE COMMANDS --------
#[tauri::command]
fn setup_employee_table(app: tauri::AppHandle) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    create_employee_table(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_new_employee(app: tauri::AppHandle, name: String, password: String) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    add_employee(&conn, &name, &password).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn fetch_employees(app: tauri::AppHandle) -> Result<Vec<Employee>, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    get_employees(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_employee_cmd(app: tauri::AppHandle, id: i32, name: String, password: String) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    update_employee(&conn, id, &name, &password).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn login_employee_cmd(app: tauri::AppHandle, name: String, password: String) -> Result<Option<Employee>, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    verify_employee(&conn, &name, &password).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_employee_cmd(app: tauri::AppHandle, id: i32) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    delete_employee(&conn, id).map(|_| ()).map_err(|e| e.to_string())
}


// ---------------- PRODUCT COMMANDS ----------------
#[tauri::command]
fn setup_product_table(app: tauri::AppHandle) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    create_product_table(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_product_cmd(app: tauri::AppHandle, name: String, price: f64, barcode: Option<String>) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    add_product(&conn, &name, price, barcode.as_deref())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_products_cmd(app: tauri::AppHandle) -> Result<Vec<Product>, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    get_products(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_product_cmd(app: tauri::AppHandle, id: i32, name: String, price: f64, barcode: String) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    update_product(&conn, id, &name, price, &barcode).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_product_cmd(app: tauri::AppHandle, id: i32) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    delete_product(&conn, id).map(|_| ()).map_err(|e| e.to_string())
}

// ---------------- SALE COMMANDS ----------------
#[tauri::command]
fn start_sale_cmd(app: tauri::AppHandle, employee_id: i32) -> Result<i64, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;

    start_sale(&conn, employee_id).map_err(|e| e.to_string())
}


#[tauri::command]
fn add_sale_item_cmd(
    app: tauri::AppHandle,
    sale_id: i64,
    product_id: i32,
    quantity: i32,
    price: f64,  
    extra_amount: f64 
) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    add_sale_item(&conn, sale_id, product_id, quantity, price, extra_amount)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn finalize_sale_cmd(app: tauri::AppHandle, sale_id: i64) -> Result<(), String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    update_sale_total(&conn, sale_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_sales_cmd(app: tauri::AppHandle) -> Result<Vec<SaleReport>, String> {
    let conn = init_db(&app).map_err(|e| e.to_string())?;
    get_all_sales(&conn).map_err(|e| e.to_string())
}


// ---------------- REPORTS COMMANDS ----------------
#[tauri::command]
fn get_report_cmd(
    app: tauri::AppHandle,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<SalesReport, String> {
    let conn = establish_connection(&app).map_err(|e| e.to_string())?;

    let start = start_date.as_deref();
    let end = end_date.as_deref();

    get_report(&conn, start, end).map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Admin
            setup_admin,
            login_admin,
            update_admin_cmd,
            verify_old_password_cmd,
            reset_admin,
            get_admin_name,
            // Employee
            setup_employee_table,
            add_new_employee,
            fetch_employees,
            update_employee_cmd,
            login_employee_cmd,
            delete_employee_cmd,
            // Product
            setup_product_table,
            add_product_cmd,
            get_products_cmd,
            update_product_cmd,
            delete_product_cmd,
            // sale
            start_sale_cmd,
            add_sale_item_cmd,
            finalize_sale_cmd,
            get_all_sales_cmd,
            // Reports
            get_report_cmd,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
