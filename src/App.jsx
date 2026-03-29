import React, { useState } from "react";

const ITEMS = [
  { code: "C01", name: "Espresso", price: 500 },
  { code: "C02", name: "Latte", price: 800 },
  { code: "C03", name: "Cappuccino", price: 850 },
  { code: "C04", name: "Iced Coffee", price: 900 },
  { code: "F01", name: "Croissant", price: 700 },
  { code: "F02", name: "Blueberry Muffin", price: 750 }
];

const STAFF = ["Jenelia", "Juanita", "Malisa"];

const ENABLE_ONLINE_SYNC = true;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyvF2WP7xtdk-3rY4KovU6S1X4gJJHutUTQKHy_VRA0z-L24Cy95Hm_Tf5iRi6i9BTt/exec";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPeakHour() {
  const peakHours = [7, 8, 9, 12, 13, 17, 18];
  return peakHours[Math.floor(Math.random() * peakHours.length)];
}

export default function App() {
  const [selectedItem, setSelectedItem] = useState(ITEMS[0]);
  const [quantity, setQuantity] = useState(1);
  const [staff, setStaff] = useState("Jenelia");
  const [transactions, setTransactions] = useState([]);
  const [receipt, setReceipt] = useState(null);

  const subtotal = selectedItem.price * quantity;
  const vat = subtotal * 0.16;
  const totalPrice = subtotal + vat;

  const postToSheet = (data) => {
    if (!ENABLE_ONLINE_SYNC) return;
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(() => {});
  };

  const handleSubmit = () => {
    if (!selectedItem || quantity < 1) return;

    const now = new Date();

    const newTransaction = {
      time: now.toLocaleString(),
      itemCode: selectedItem.code,
      itemNumber: "CF" + Date.now(),
      description: selectedItem.name,
      price: selectedItem.price,
      quantity,
      subtotal,
      vat,
      total: totalPrice,
      staff
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setReceipt(newTransaction);
    postToSheet(newTransaction);
  };

  const generateBulk = () => {
    const batch = [];

    for (let i = 0; i < 100; i++) {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

      const qty = randomBetween(1, 3);
      const sub = item.price * qty;
      const vatAmt = sub * 0.16;
      const total = sub + vatAmt;

      const daysAgo = randomBetween(0, 6);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const hour = randomPeakHour();
      const minute = randomBetween(0, 59);
      date.setHours(hour, minute);

      const transaction = {
        time: date.toLocaleString(),
        itemCode: item.code,
        itemNumber: "CF" + (Date.now() + i),
        description: item.name,
        price: item.price,
        quantity: qty,
        subtotal: sub,
        vat: vatAmt,
        total,
        staff: STAFF[randomBetween(0, STAFF.length - 1)]
      };

      batch.push(transaction);
      postToSheet(transaction);
    }

    setTransactions((prev) => [...prev, ...batch]);
    alert("Realistic transactions generated!");
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const averageSale = transactions.length ? (totalRevenue / transactions.length).toFixed(2) : 0;

  const staffStats = {};
  transactions.forEach((t) => {
    if (!staffStats[t.staff]) staffStats[t.staff] = 0;
    staffStats[t.staff] += t.total;
  });

  return (
    <div style={{ fontFamily: "Arial", background: "#f4f4f4", padding: "30px" }}>
      <div style={{ maxWidth: "900px", margin: "auto", background: "white", padding: "30px", borderRadius: "12px" }}>

        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>☕ The Daily Grind Coffee Co.</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          <div>
            <h3>Point of Sale</h3>

            <select style={{ width: "100%", padding: "10px", marginBottom: "10px" }} value={selectedItem.code} onChange={(e) => setSelectedItem(ITEMS.find(i => i.code === e.target.value))}>
              {ITEMS.map(item => (
                <option key={item.code} value={item.code}>{item.name} - ${item.price}</option>
              ))}
            </select>

            <input style={{ width: "100%", padding: "10px", marginBottom: "10px" }} type="number" value={quantity} min={1} onChange={(e) => setQuantity(Number(e.target.value))} />

            <select style={{ width: "100%", padding: "10px", marginBottom: "10px" }} value={staff} onChange={(e) => setStaff(e.target.value)}>
              {STAFF.map(s => <option key={s}>{s}</option>)}
            </select>

            <div style={{ background: "#fafafa", padding: "15px", borderRadius: "8px", marginBottom: "15px" }}>
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>VAT (16%): ${vat.toFixed(2)}</p>
              <h3>Total: ${totalPrice.toFixed(2)}</h3>
            </div>

            <button onClick={handleSubmit}>Submit</button>
            <button onClick={generateBulk} style={{ marginLeft: "10px" }}>Generate Realistic Data</button>
          </div>

          <div>
            <h3>Receipt</h3>
            {receipt ? (
              <div style={{ background: "#fafafa", padding: "15px", borderRadius: "8px" }}>
                <p>{receipt.description} x {receipt.quantity}</p>
                <p>VAT: ${receipt.vat.toFixed(2)}</p>
                <p>Total: ${receipt.total.toFixed(2)}</p>
                <p>Staff: {receipt.staff}</p>
              </div>
            ) : <p>No transaction yet</p>}
          </div>

        </div>

        <hr style={{ margin: "30px 0" }} />

        <h3>Daily Report</h3>
        <p>Total Transactions: {transactions.length}</p>
        <p>Total Revenue: ${totalRevenue.toFixed(2)}</p>
        <p>Average Sale: ${averageSale}</p>

        <h4>Staff Performance</h4>
        {Object.entries(staffStats).map(([name, total]) => (
          <p key={name}>{name}: ${total.toFixed(2)}</p>
        ))}

      </div>
    </div>
  );
}
