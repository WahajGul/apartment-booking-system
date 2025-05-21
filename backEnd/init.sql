CREATE DATABASE IF NOT EXISTS apartments;
USE apartments;
CREATE TABLE IF NOT EXISTS customers(
    customer_id INT AUTO_INCREMENT PRIMARY KEY DEFAULT 1,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact VARCHAR(15) NOT NULL,
    email VARCHAR(50),
    nic VARCHAR(15),
    customer_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
);


CREATE TABLE IF NOT EXISTS apartments (
    apartment_id INT AUTO_INCREMENT PRIMARY KEY,
    floor INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    size INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'booked', 'sold') DEFAULT 'available'
);

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

