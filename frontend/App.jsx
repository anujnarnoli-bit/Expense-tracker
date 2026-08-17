import { useEffect, useState } from "react";
import api from "./api";

export default function App() {
  // Agar token pehle se localStorage mein hai to user already logged in hai
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [showRegister, setShowRegister] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) {
    return showRegister ? (
      <AuthForm type="register" onSuccess={setUser} switchForm={() => setShowRegister(false)} />
    ) : (
      <AuthForm type="login" onSuccess={setUser} switchForm={() => setShowRegister(true)} />
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

// ---------- Login / Register Form ----------
function AuthForm({ type, onSuccess, switchForm }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = type === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Kuch galat ho gaya");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">
        <h1 className="text-xl font-bold text-slate-800">
          {type === "login" ? "Login" : "Register"}
        </h1>

        {type === "register" && (
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Naam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium">
          {type === "login" ? "Login karo" : "Register karo"}
        </button>

        <p className="text-sm text-center text-slate-500">
          {type === "login" ? "Naya account? " : "Already account hai? "}
          <button type="button" onClick={switchForm} className="text-blue-600 underline">
            {type === "login" ? "Register karein" : "Login karein"}
          </button>
        </p>
      </form>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ user, onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ type: "expense", category: "", amount: "", date: "" });

  // Component load hote hi transactions fetch karo
  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const { data } = await api.get("/transactions");
    setTransactions(data);
  }

  async function handleAdd(e) {
    e.preventDefault();
    await api.post("/transactions", form);
    setForm({ type: "expense", category: "", amount: "", date: "" });
    fetchTransactions(); // list ko refresh karo
  }

  async function handleDelete(id) {
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  }

  // Total income aur expense nikaalo insights ke liye
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">Namaste, {user.name}</h1>
          <button onClick={onLogout} className="text-red-500 underline">
            Logout
          </button>
        </div>

        {/* Insights cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card label="Income" value={income} color="text-green-600" />
          <Card label="Expense" value={expense} color="text-red-600" />
          <Card label="Balance" value={income - expense} color="text-blue-600" />
        </div>

        {/* Add transaction form */}
        <form onSubmit={handleAdd} className="bg-white p-4 rounded-xl shadow flex gap-2 flex-wrap">
          <select
            className="border rounded px-2 py-1"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input
            className="border rounded px-2 py-1 flex-1"
            placeholder="Category (jaise: Food)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1 w-24"
            placeholder="Amount"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            className="border rounded px-2 py-1"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <button className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
        </form>

        {/* Transaction history */}
        <div className="bg-white rounded-xl shadow divide-y">
          {transactions.map((t) => (
            <div key={t._id} className="flex justify-between items-center p-3">
              <div>
                <p className="font-medium">{t.category}</p>
                <p className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount}
                </span>
                <button onClick={() => handleDelete(t._id)} className="text-slate-400 text-sm">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${color}`}>₹{value}</p>
    </div>
  );
}
