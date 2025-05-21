import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
});

const dbName = "apartments";

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
});

await connection.query(`
CREATE DATABASE IF NOT EXISTS apartments;
    `);
await connection.query(`
USE apartments;
    `);
await connection.query(`

CREATE TABLE IF NOT EXISTS customers(
    customer_id INT AUTO_INCREMENT PRIMARY KEY ,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    email VARCHAR(50),
    nic VARCHAR(15),
    customer_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

await connection.query(`
CREATE TABLE IF NOT EXISTS apartments (
    apartment_id INT AUTO_INCREMENT PRIMARY KEY,
    floor INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    size INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'booked', 'sold') DEFAULT 'available'
);
`);

await connection.query(`
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    apartment_id INT NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    down_payment DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id),
    UNIQUE (apartment_id) -- Ensures one active booking per apartment
);
`);

await connection.query(`
CREATE TABLE IF NOT EXISTS installments (
    installment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    installment_number INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
    UNIQUE (booking_id, installment_number)
);

    `);

// --- CUSTOMERS ---
export async function insertCustomer(first_name, last_name, contact, email, nic) {
  const [result] = await connection.query(
    `INSERT INTO customers (first_name, last_name, contact, email, nic) VALUES (?, ?, ?, ?, ?)`,
    [first_name, last_name, contact, email, nic]
  );
  return result;
}

export async function updateCustomer(id, first_name, last_name, contact, email, nic) {
  const [result] = await connection.query(
    `UPDATE customers SET first_name=?, last_name=?, contact=?, email=?, nic=? WHERE customer_id=?`,
    [first_name, last_name, contact, email, nic, id]
  );
  return result;
}

export async function deleteCustomer(id) {
  const [result] = await connection.query(
    `DELETE FROM customers WHERE customer_id=?`,
    [id]
  );
  return result;
}

export async function showAllCustomers() {
  const [result] = await connection.query(`SELECT * FROM customers`);
  return result;
}

export async function searchCustomers(column, value) {
  if (!column || !value) return showAllCustomers();
  const [result] = await connection.query(
    `SELECT * FROM customers WHERE ${column} LIKE ?`,
    [`%${value}%`]
  );
  return result;
}

// --- APARTMENTS ---
export async function insertApartment(floor, type, size, price, status = 'available') {
  const [result] = await connection.query(
    `INSERT INTO apartments (floor, type, size, price, status) VALUES (?, ?, ?, ?, ?)`,
    [floor, type, size, price, status]
  );
  return result;
}

export async function deleteApartment(apartment_id) {
  const [result] = await connection.query(
    `DELETE FROM apartments WHERE apartment_id = ?`,
    [apartment_id]
  );
  return result;
}

export async function showAllApartments() {
  const [result] = await connection.query(`SELECT * FROM apartments`);
  return result;
}

export async function searchApartments(column, value) {
  if (!column || !value) return showAllApartments();
  const [result] = await connection.query(
    `SELECT * FROM apartments WHERE ${column} LIKE ?`,
    [`%${value}%`]
  );
  return result;
}

// --- BOOKINGS ---
export async function insertBooking(customer_id, apartment_id, down_payment, status = 'pending') {
  const [result] = await connection.query(
    `INSERT INTO bookings (customer_id, apartment_id, down_payment, status) VALUES (?, ?, ?, ?)`,
    [customer_id, apartment_id, down_payment, status]
  );
  return result;
}

export async function deleteBooking(booking_id) {
  const [result] = await connection.query(
    `DELETE FROM bookings WHERE booking_id = ?`,
    [booking_id]
  );
  return result;
}

export async function showAllBookings() {
  const [result] = await connection.query(`
    SELECT 
      b.*, 
      c.first_name AS customer_first_name, 
      c.last_name AS customer_last_name
    FROM bookings b
    JOIN customers c ON b.customer_id = c.customer_id
  `);
  return result;
}

export async function searchBookings(column, value) {
  if (!column || !value) return showAllBookings();
  const [result] = await connection.query(`
    SELECT 
      b.*, 
      c.first_name AS customer_first_name, 
      c.last_name AS customer_last_name
    FROM bookings b
    JOIN customers c ON b.customer_id = c.customer_id
    WHERE b.${column} LIKE ?
  `, [`%${value}%`]);
  return result;
}

// --- INSTALLMENTS ---
export async function insertInstallment(booking_id, installment_number, amount, due_date, payment_date = null, status = 'pending') {
  const [result] = await connection.query(
    `INSERT INTO installments (booking_id, installment_number, amount, due_date, payment_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [booking_id, installment_number, amount, due_date, payment_date, status]
  );
  return result;
}

export async function deleteInstallment(installment_id) {
  const [result] = await connection.query(
    `DELETE FROM installments WHERE installment_id = ?`,
    [installment_id]
  );
  return result;
}

export async function showAllInstallments() {
  const [result] = await connection.query(`
    SELECT 
      i.*, 
      b.customer_id, 
      c.first_name AS customer_first_name, 
      c.last_name AS customer_last_name,
      b.apartment_id
    FROM installments i
    JOIN bookings b ON i.booking_id = b.booking_id
    JOIN customers c ON b.customer_id = c.customer_id
  `);
  return result;
}

export async function searchInstallments(column, value) {
  if (!column || !value) return showAllInstallments();
  const [result] = await connection.query(`
    SELECT 
      i.*, 
      b.customer_id, 
      c.first_name AS customer_first_name, 
      c.last_name AS customer_last_name,
      b.apartment_id
    FROM installments i
    JOIN bookings b ON i.booking_id = b.booking_id
    JOIN customers c ON b.customer_id = c.customer_id
    WHERE i.${column} LIKE ?
  `, [`%${value}%`]);
  return result;
}
