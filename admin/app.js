document.addEventListener("DOMContentLoaded", fetchOrders);

function fetchOrders() {
  fetch("http://localhost:3000/orders")
    .then(res => res.json())
    .then(data => {
      const statusMap = {
        Pending: document.querySelector("#pending-orders tbody"),
        Processing: document.querySelector("#processing-orders tbody"),
        Shipped: document.querySelector("#shipped-orders tbody"),
        Delivered: document.querySelector("#delivered-orders tbody")
      };

      Object.values(statusMap).forEach(tbody => tbody.innerHTML = "");

      const tableHeadings = `
        <tr>
          <th>Order ID</th>
          <th>Payment ID</th>
          <th>Amount</th>
          <th>Customer</th>
          <th>Address</th>
          <th>Status</th>
          <th>Update</th>
        </tr>`;

      Object.entries(statusMap).forEach(([status, tbody]) => {
        tbody.closest("table").querySelector("thead tr").innerHTML = tableHeadings;
      });

      data.forEach(order => {
        const tbody = statusMap[order.status];
        if (!tbody) return;

        const row = document.createElement("tr");
        const statusBadge = getStatusBadge(order.status);
        const statusSelect = `
          <div class="select-wrapper">
            <select class="status-dropdown" data-id="${order._id}">
              ${["Pending", "Processing", "Shipped", "Delivered"].map(
                s => `<option value="${s}" ${order.status === s ? "selected" : ""}>${s}</option>`
              ).join("")}
            </select>
            <button class="update-btn" onclick="updateStatus('${order._id}')">Update</button>
          </div>`;

        row.innerHTML = `
          <td>${order.orderId || "-"}</td>
          <td>${order.paymentId}</td>
          <td>₹${(order.amount / 100).toFixed(2)}</td>
          <td>${order.name}<br/><small>${order.email}<br/>${order.phone}</small></td>
          <td>${order.address}</td>
          <td>${statusBadge}</td>
          <td>${statusSelect}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(err => console.error("Fetch error:", err));
}


function getStatusBadge(status) {
  const classMap = {
    "Pending": "status-pending",
    "Processing": "status-processing",
    "Shipped": "status-shipped",
    "Delivered": "status-delivered"
  };
  return `<span class="status-badge ${classMap[status] || ""}">${status}</span>`;
}

function updateStatus(id) {
  const dropdown = document.querySelector(`select[data-id="${id}"]`);
  const newStatus = dropdown.value;

  fetch(`http://localhost:3000/orders/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  })
    .then(res => res.json())
    .then(data => {
      alert("Status updated!");
      fetchOrders(); // Refresh table
    })
    .catch(err => {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    });
}
