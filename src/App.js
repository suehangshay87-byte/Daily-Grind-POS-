import React, { useState } from "react";

const ITEMS = [
  { code: "C01", name: "Espresso", price: 500 },
  { code: "C02", name: "Latte", price: 800 },
  { code: "C03", name: "Cappuccino", price: 850 },
  { code: "C04", name: "Iced Coffee", price: 900 },
  { code: "F01", name: "Croissant", price: 700 },
  { code: "F02", name: "Blueberry Muffin", price: 750 },
];

const ENABLE_ONLINE_SYNC = true;
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyvF2WP7xtdk-3rY4KovU6S1X4gJJHutUTQKHy_VRA0z-L24Cy95Hm_Tf5iRi6i9BTt/exec";

export default function App() {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [quantity, setQuantity] = useState(1);
  const [staff, setStaff] = useState("Jenelia");
  const [transactions, setTransactions] = useState([]);

  const totalPrice = selectedItem.price * quantity;

  const postToSheet = (data) => {
    if (!ENABLE_ONLINE_SYNC) return;

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  const handleSubmit = () => {
    if (!selectedItem || quantity < 1) return;

    const newTransaction = {
      time: new Date().toLocaleString(),
      itemCode: selectedItem.code,
      itemNumber: "CF" + Date.now(),
      description: selectedItem.name,
      price: selectedItem.price,
      quantity: quantity,
      total: totalPrice,
      staff: staff,
    };

    setTransactions((prev) => [...prev, newTransaction]);
    postToSheet(newTransaction);
  };

  const generateBulk = () => {
    const batch = [];

    for (let i = 0; i < 100; i++) {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      const qty = Math.floor(Math.random() * 3) + 1;

      const transaction = {
        time: new Date().toLocaleString(),
        itemCode: item.code,
        itemNumber: "CF" + (Date.now() + i),
        description: item.name,
        price: item.price,
        quantity: qty,
        total: item.price * qty,
        staff: ["Jenelia", "Juanita", "Malisa"][i % 3],
      };

      batch.push(transaction);
      postToSheet(transaction);
    }

    setTransactions((prev) => [...prev, ...batch]);
    alert("Transactions generated successfully!");
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);

  return (
    <div style={{ padding: "20px" }}>
      <h2>The Daily Grind Coffee Co. POS</h2>

      <div>
        <label>Item</label>
        <br />
        <select
          value={selectedItem.code}
          onChange={(e) => {
            const found = ITEMS.find((i) => i.code === e.target.value);
            if (found) setSelectedItem(found);
          }}
        >
          {ITEMS.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} - ${item.price}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Quantity</label>
        <br />
        <input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) =>
            setQuantity(Math.max(1, Number(e.target.value) || 1))
          }
        />
      </div>

      <div>
        <label>Staff</label>
        <br />
        <select value={staff} onChange={(e) => setStaff(e.target.value)}>
          <option>Jenelia</option>
          <option>Juanita</option>
          <option>Malisa</option>
        </select>
      </div>

      <p>
        <strong>Total: ${totalPrice}</strong>
      </p>

      <button onClick={handleSubmit}>Submit Transaction</button>
      <button onClick={generateBulk} style={{ marginLeft: "10px" }}>
        Generate Bulk Transactions
      </button>

      <hr />

      <h3>Daily Productivity Report</h3>
      <p>Total Transactions: {transactions.length}</p>
      <p>Total Revenue: ${totalRevenue}</p>

      <table border="1" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Item</th>
            <th>Qty</th>
            <th>Staff</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.itemNumber}>
              <td>{t.time}</td>
              <td>{t.description}</td>
              <td>{t.quantity}</td>
              <td>{t.staff}</td>
              <td>${t.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
