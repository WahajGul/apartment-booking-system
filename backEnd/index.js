import express from "express";
import cors from "cors";
import {
  showAllCustomers, insertCustomer, deleteCustomer, searchCustomers, updateCustomer,
  showAllApartments, insertApartment, deleteApartment, searchApartments,
  showAllBookings, insertBooking, deleteBooking, searchBookings,
  showAllInstallments, insertInstallment, deleteInstallment, searchInstallments
} from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- CUSTOMERS ---
app.get("/customers", async (req, res) => {
  const { column, value } = req.query;
  const data = await searchCustomers(column, value);
  res.json(data);
});
app.post("/customers", async (req, res) => {
  const { first_name, last_name, contact, email, nic } = req.body;
  const result = await insertCustomer(first_name, last_name, contact, email, nic);
  res.status(201).json(result);
});
app.put("/customers/:id", async (req, res) => {
  const { first_name, last_name, contact, email, nic } = req.body;
  const { id } = req.params;
  const result = await updateCustomer(id, first_name, last_name, contact, email, nic);
  res.json(result);
});
app.delete("/customers/:id", async (req, res) => {
  const { id } = req.params;
  const result = await deleteCustomer(id);
  res.json(result);
});

// --- APARTMENTS ---
app.get("/apartments", async (req, res) => {
  const { column, value } = req.query;
  const data = await searchApartments(column, value);
  res.json(data);
});
app.post("/apartments", async (req, res) => {
  const { floor, type, size, price, status } = req.body;
  const result = await insertApartment(floor, type, size, price, status);
  res.status(201).json(result);
});
app.delete("/apartments/:id", async (req, res) => {
  const result = await deleteApartment(req.params.id);
  res.json(result);
});

// --- BOOKINGS ---
app.get("/bookings", async (req, res) => {
  const { column, value } = req.query;
  const data = await searchBookings(column, value);
  res.json(data);
});
app.post("/bookings", async (req, res) => {
  const { customer_id, apartment_id, down_payment, status } = req.body;
  // Insert booking
  const bookingResult = await insertBooking(customer_id, apartment_id, down_payment, status);

  // Get apartment price
  const [apartment] = await searchApartments('apartment_id', apartment_id);
  if (!apartment) return res.status(400).json({ error: "Apartment not found" });

  // Calculate installment
  const remaining = apartment.price - down_payment;
  const monthly = +(remaining / 12).toFixed(2);

  // Insert first installment (for current month)
  const today = new Date();
  const due_date = today.toISOString().split('T')[0]; // YYYY-MM-DD
  await insertInstallment(bookingResult.insertId, 1, monthly, due_date, null, 'pending');

  res.status(201).json({ booking: bookingResult, first_installment: { amount: monthly, due_date } });
});
app.delete("/bookings/:id", async (req, res) => {
  const result = await deleteBooking(req.params.id);
  res.json(result);
});

// --- INSTALLMENTS ---
app.get("/installments", async (req, res) => {
  const { column, value } = req.query;
  const data = await searchInstallments(column, value);
  res.json(data);
});
app.post("/installments", async (req, res) => {
  const { booking_id, installment_number, amount, due_date, payment_date, status } = req.body;
  const result = await insertInstallment(booking_id, installment_number, amount, due_date, payment_date, status);
  res.status(201).json(result);
});
app.delete("/installments/:id", async (req, res) => {
  const result = await deleteInstallment(req.params.id);
  res.json(result);
});

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("something broke");
});

app.listen(8080, () => {
  console.log("server is running on 8080");
});
