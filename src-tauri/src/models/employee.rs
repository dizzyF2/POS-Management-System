use rusqlite::{params, Connection, Result};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Employee {
    pub id: i32,
    pub name: String,
}

pub fn create_employee_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn add_employee(conn: &Connection, name: &str) -> Result<usize> {
    conn.execute("INSERT INTO employees (name) VALUES (?1)", params![name])
}

pub fn update_employee(conn: &Connection, id: i32, name: &str) -> Result<usize> {
    conn.execute("UPDATE employees SET name=?1 WHERE id=?2", params![name, id])
}

pub fn delete_employee(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM employees WHERE id=?1", params![id])
}

pub fn get_employees(conn: &Connection) -> Result<Vec<Employee>> {
    let mut stmt = conn.prepare("SELECT id, name FROM employees ORDER BY id DESC")?;
    let rows = stmt.query_map([], |row| {
        Ok(Employee {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}