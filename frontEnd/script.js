toggle.onclick = function () {
  sideBar.classList.toggle("active");
  toggle.innerText = toggle.innerText == `=` ? "X" : "=";
};

// --- Navigation ---
dashboardNavBtn.onclick = () => {
  setLiActive(dashboardLi);
  showSec(dashboardSec);
};
customersNavBtn.onclick = () => {
  setLiActive(customersLi);
  showSec(customersSec);
  loadCustomers();
};
apartmentsNavBtn.onclick = () => {
  setLiActive(apartmentsLi);
  showSec(apartmentsSec);
  loadApartments();
};
bookingsNavBtn.onclick = () => {
  setLiActive(bookingsLi);
  showSec(bookingsSec);
  loadBookings();
};
installmentsNavBtn.onclick = () => {
  setLiActive(installmentsLi);
  showSec(installmentsSec);
  loadInstallments();
};

function setLiActive(navID) {
  document.querySelectorAll(".side-bar ul li").forEach((l) => {
    l.classList.remove("active");
  });
  navID.classList.add("active");
}
function showSec(secID) {
  document.querySelectorAll(".main section").forEach((s) => {
    s.style.display = "none";
    s.classList.remove("active-sec");
  });
  secID.classList.add("active-sec");
  secID.style.display = "block";
}

// --- Helper functions ---
async function getAll(table) {
  const res = await fetch(`http://localhost:8080/${table}`);
  return res.json();
}
async function search(table, column, value) {
  const res = await fetch(`http://localhost:8080/${table}?column=${column}&value=${value}`);
  return res.json();
}
async function addRow(table, data) {
  const res = await fetch(`http://localhost:8080/${table}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
async function deleteRow(table, id) {
  const res = await fetch(`http://localhost:8080/${table}/${id}`, {
    method: "DELETE"
  });
  return res.json();
}

async function updateRow(table, id, data) {
  const res = await fetch(`http://localhost:8080/${table}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

// --- Customers ---
async function loadCustomers() {
  const data = await getAll("customers");
  customerBody.innerHTML = data.map(c => `
    <tr data-id="${c.customer_id}">
      <td>${c.customer_id}</td>
      <td>${c.first_name}</td>
      <td>${c.last_name}</td>
      <td>${c.email}</td>
      <td>${c.contact}</td>
      <td>${c.nic}</td>
      <td>${new Date(c.customer_created).toLocaleString()}</td>
      <td>
        <button class="edit-btn" data-id="${c.customer_id}">Edit</button>
        <button class="delete-btn" data-id="${c.customer_id}">Delete</button>
      </td>
    </tr>
  `).join('');
  setCustomerActions();
}
customerForm.onsubmit = async function(e) {
  e.preventDefault();
  if (!firstNameInput.value || !lastNameInput.value || !emailInput.value || !contactInput.value || !nicInput.value) {
    alert("Missing field");
    return;
  }
  await addRow("customers", {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
    email: emailInput.value,
    contact: contactInput.value,
    nic: nicInput.value
  });
  customerForm.reset();
  loadCustomers();
};
customerSearchInput.oninput = async function() {
  const val = customerSearchInput.value.trim();
  if (!val) return loadCustomers();
  const data = await search("customers", "first_name", val);
  customerBody.innerHTML = data.map(c => `
    <tr>
      <td>${c.first_name}</td>
      <td>${c.last_name}</td>
      <td>${c.email}</td>
      <td>${c.contact}</td>
      <td>${c.nic}</td>
      <td>${new Date(c.customer_created).toLocaleString()}</td>
    </tr>
  `).join('');
};

function setCustomerActions() {
  // Delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = async () => {
      if (confirm('Delete this customer?')) {
        await deleteRow('customers', btn.dataset.id);
        loadCustomers();
      }
    };
  });

  // Edit
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      // Hide add form, show edit form
      customerForm.style.display = "none";
      customerEditForm.style.display = "block";
      document.getElementById('updateCustomerBtn').textContent = "Update Customer";

      // Get row data
      const row = btn.closest('tr');
      editCustomerId.value = row.children[0].textContent;
      editFirstNameInput.value = row.children[1].textContent;
      editLastNameInput.value = row.children[2].textContent;
      editEmailInput.value = row.children[3].textContent;
      editContactInput.value = row.children[4].textContent;
      editNicInput.value = row.children[5].textContent;
    };
  });
}

// Handle update submit
customerEditForm.onsubmit = async function(e) {
  e.preventDefault();
  await updateRow('customers', editCustomerId.value, {
    first_name: editFirstNameInput.value,
    last_name: editLastNameInput.value,
    email: editEmailInput.value,
    contact: editContactInput.value,
    nic: editNicInput.value
  });
  customerEditForm.reset();
  customerEditForm.style.display = "none";
  customerForm.style.display = "block";
  loadCustomers();
};

// Handle cancel
cancelEditBtn.onclick = function() {
  customerEditForm.reset();
  customerEditForm.style.display = "none";
  customerForm.style.display = "block";
};

// --- Apartments ---
async function loadApartments() {
  const data = await getAll("apartments");
  apartmentsBody.innerHTML = data.map(a => `
    <tr>
      <td>${a.apartment_id}</td>
      <td>${a.floor}</td>
      <td>${a.type}</td>
      <td>${a.price}</td>
      <td>${a.size}</td>
      <td>${a.status}</td>
      <td>${a.created_at ? new Date(a.created_at).toLocaleString() : ''}</td>
    </tr>
  `).join('');
}
apartmentsForm.onsubmit = async function(e) {
  e.preventDefault();
  if (!floorInput.value || !typeInput.value || !prizeInput.value || !sizeInput.value) {
    alert("Missing field");
    return;
  }
  await addRow("apartments", {
    floor: floorInput.value,
    type: typeInput.value,
    price: prizeInput.value,
    size: sizeInput.value
  });
  apartmentsForm.reset();
  loadApartments();
};
apartmentSearchInput.oninput = async function() {
  const val = apartmentSearchInput.value.trim();
  if (!val) return loadApartments();
  const data = await search("apartments", "type", val);
  apartmentsBody.innerHTML = data.map(a => `
    <tr>
      <td>${a.apartment_id}</td>
      <td>${a.floor}</td>
      <td>${a.type}</td>
      <td>${a.price}</td>
      <td>${a.size}</td>
      <td>${a.status}</td>
      <td>${a.created_at ? new Date(a.created_at).toLocaleString() : ''}</td>
    </tr>
  `).join('');
};

// --- Bookings ---
async function loadBookings() {
  const data = await getAll("bookings");
  bookingsBody.innerHTML = data.map(b => `
    <tr>
      <td>${b.customer_id}</td>
      <td>${b.customer_first_name} ${b.customer_last_name}</td>
      <td>${b.apartment_id}</td>
      <td>${b.down_payment}</td>
      <td>${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
    </tr>
  `).join('');
}
bookingForm.onsubmit = async function(e) {
  e.preventDefault();
  if (!apartmentIdInput.value || !customerIdInput.value || !downPaymentInput.value) {
    alert("Missing field");
    return;
  }
  await addRow("bookings", {
    apartment_id: apartmentIdInput.value,
    customer_id: customerIdInput.value,
    down_payment: downPaymentInput.value
  });
  bookingForm.reset();
  loadBookings();
};
bookingSearchInput.oninput = async function() {
  const val = bookingSearchInput.value.trim();
  if (!val) return loadBookings();
  const data = await search("bookings", "customer_id", val);
  bookingsBody.innerHTML = data.map(b => `
    <tr>
      <td>${b.customer_id}</td>
      <td>${b.customer_name || ""}</td>
      <td>${b.apartment_id}</td>
      <td>${b.down_payment}</td>
      <td>${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
    </tr>
  `).join('');
};

// --- Installments ---
async function loadInstallments() {
  const data = await getAll("installments");
  installmentsBody.innerHTML = data.map(i => `
    <tr>
      <td>${i.installment_id}</td>
      <td>${i.booking_id}</td>
      <td>${i.customer_first_name} ${i.customer_last_name}</td>
      <td>${i.apartment_id}</td>
      <td>${i.installment_number}</td>
      <td>${i.amount}</td>
      <td>${i.due_date ? new Date(i.due_date).toLocaleDateString() : ''}</td>
      <td>${i.status}</td>
    </tr>
  `).join('');
}
installmentForm.onsubmit = async function(e) {
  e.preventDefault();
  if (!bookingIdInput.value || !installmentNumberInput.value || !amountInput.value || !dueDateInput.value) {
    alert("Missing field");
    return;
  }
  await addRow("installments", {
    booking_id: bookingIdInput.value,
    installment_number: installmentNumberInput.value,
    amount: amountInput.value,
    due_date: dueDateInput.value
  });
  installmentForm.reset();
  loadInstallments();
};
installmentSearchInput.oninput = async function() {
  const val = installmentSearchInput.value.trim();
  if (!val) return loadInstallments();
  const data = await search("installments", "booking_id", val);
  installmentsBody.innerHTML = data.map(i => `
    <tr>
      <td>${i.booking_id}</td>
      <td>${i.installment_number}</td>
      <td>${i.amount}</td>
      <td>${i.due_date}</td>
      <td>${i.status}</td>
    </tr>
  `).join('');
};

// --- Dashboard Example Load ---
function loadDashboardExample() {
  // Example stats
  totalCustomers.textContent = 12;
  totalApartments.textContent = 8;
  availableApartments.textContent = 3;
  totalBookings.textContent = 6;
  pendingInstallments.textContent = 4;

  // Example recent bookings
  recentBookings.innerHTML = `
    <li>Ali Hassan booked Apartment #2 (2025-05-20)</li>
    <li>Sara Khan booked Apartment #5 (2025-05-18)</li>
    <li>Ahmed Raza booked Apartment #1 (2025-05-15)</li>
  `;

  // Example upcoming installments
  upcomingInstallments.innerHTML = `
    <li>Ali Hassan - Rs. 10,000 due on 2025-06-01</li>
    <li>Sara Khan - Rs. 12,000 due on 2025-06-03</li>
    <li>Ahmed Raza - Rs. 8,500 due on 2025-06-05</li>
  `;
}

// Call this on page load for demo
window.onload = function() {
  loadDashboardExample();
  loadCustomers();
  loadApartments();
  loadBookings();
  loadInstallments();
};
