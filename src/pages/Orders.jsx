import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileSpreadsheet,
  Package,
  RefreshCcw,
  Search,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import * as XLSX from "xlsx";

import { supabase } from "../lib/supabaseClient";
import "../styles/admin.css";

function money(value) {
  return Number(value || 0).toLocaleString();
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString();
}

function safeDateInput(date) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [message, setMessage] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setMessage(error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function updateOrder(id, updates) {
    const { error } = await supabase
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchOrders();
  }

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const createdDate = safeDateInput(order.created_at);

      const matchesSearch =
        !term ||
        order.product_name?.toLowerCase().includes(term) ||
        order.product_category?.toLowerCase().includes(term) ||
        order.customer_name?.toLowerCase().includes(term) ||
        order.customer_email?.toLowerCase().includes(term) ||
        order.customer_phone?.toLowerCase().includes(term) ||
        order.delivery_location?.toLowerCase().includes(term) ||
        order.notes?.toLowerCase().includes(term);

      const matchesFromDate = !fromDate || createdDate >= fromDate;
      const matchesToDate = !toDate || createdDate <= toDate;

      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" || order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesFromDate &&
        matchesToDate &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [orders, search, fromDate, toDate, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    const paidOrders = filteredOrders.filter(
      (order) => order.payment_status === "paid"
    );

    const pendingOrders = filteredOrders.filter(
      (order) =>
        order.order_status === "pending" || order.order_status === "confirmed"
    );

    return {
      total: filteredOrders.length,
      pending: pendingOrders.length,
      confirmed: filteredOrders.filter((o) => o.order_status === "confirmed")
        .length,
      completed: filteredOrders.filter((o) => o.order_status === "completed")
        .length,
      cancelled: filteredOrders.filter((o) => o.order_status === "cancelled")
        .length,
      paid: paidOrders.length,
      delivered: filteredOrders.filter((o) => o.delivery_status === "delivered")
        .length,
      revenue: paidOrders.reduce(
        (sum, order) => sum + Number(order.amount || 0),
        0
      ),
      pendingRevenue: pendingOrders.reduce(
        (sum, order) => sum + Number(order.amount || 0),
        0
      ),
      totalValue: filteredOrders.reduce(
        (sum, order) => sum + Number(order.amount || 0),
        0
      ),
    };
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const map = {};

    filteredOrders.forEach((order) => {
      const key = order.product_name || "Unknown product";

      if (!map[key]) {
        map[key] = {
          product: key,
          quantity: 0,
          orders: 0,
          value: 0,
        };
      }

      map[key].quantity += Number(order.quantity || 1);
      map[key].orders += 1;
      map[key].value += Number(order.amount || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.orders - a.orders || b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);

  const topCategories = useMemo(() => {
    const map = {};

    filteredOrders.forEach((order) => {
      const key = order.product_category || "Uncategorized";

      if (!map[key]) {
        map[key] = {
          category: key,
          orders: 0,
          value: 0,
        };
      }

      map[key].orders += 1;
      map[key].value += Number(order.amount || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.orders - a.orders || b.value - a.value)
      .slice(0, 5);
  }, [filteredOrders]);

  function buildExportRows() {
    return filteredOrders.map((order) => ({
      "Order Date": formatDate(order.created_at),
      "Product Name": order.product_name || "",
      Category: order.product_category || "",
      Quantity: order.quantity || 1,
      Amount: Number(order.amount || 0),
      "Customer Name": order.customer_name || "",
      "Customer Phone": order.customer_phone || "",
      "Customer Email": order.customer_email || "",
      "Delivery Location": order.delivery_location || "",
      "Order Status": order.order_status || "pending",
      "Payment Status": order.payment_status || "not_paid",
      "Delivery Status": order.delivery_status || "not_started",
      Source: order.source || "",
      Notes: order.notes || "",
    }));
  }

  function exportToExcel() {
    const exportRows = buildExportRows();

    if (!exportRows.length) {
      alert("No orders to export.");
      return;
    }

    const ordersSheet = XLSX.utils.json_to_sheet(exportRows);

    const summaryRows = [
      { Metric: "Total Orders", Value: stats.total },
      { Metric: "Pending Orders", Value: stats.pending },
      { Metric: "Completed Orders", Value: stats.completed },
      { Metric: "Cancelled Orders", Value: stats.cancelled },
      { Metric: "Paid Orders", Value: stats.paid },
      { Metric: "Delivered Orders", Value: stats.delivered },
      { Metric: "Paid Revenue", Value: stats.revenue },
      { Metric: "Pending Value", Value: stats.pendingRevenue },
      { Metric: "Total Order Value", Value: stats.totalValue },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    const productsSheet = XLSX.utils.json_to_sheet(topProducts);
    const categoriesSheet = XLSX.utils.json_to_sheet(topCategories);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Orders");
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Top Products");
    XLSX.utils.book_append_sheet(workbook, categoriesSheet, "Top Categories");

    const dateTag = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `tranquility-beauty-orders-${dateTag}.xlsx`);
  }

  function exportToCSV() {
    const exportRows = buildExportRows();

    if (!exportRows.length) {
      alert("No orders to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `tranquility-beauty-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch("");
    setFromDate("");
    setToDate("");
    setStatusFilter("all");
    setPaymentFilter("all");
  }

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>TB</span>

          <div>
            <h2>Tranquility</h2>
            <p>Orders Center</p>
          </div>
        </div>

        <div className="admin-menu">
          <button onClick={() => (window.location.href = "/admin")}>
            <Package size={18} />
            Back To Admin
          </button>

          <button onClick={fetchOrders}>
            <RefreshCcw size={18} />
            Refresh Orders
          </button>

          <button onClick={exportToExcel}>
            <FileSpreadsheet size={18} />
            Export Excel
          </button>

          <button onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
          <div>
            <span className="section-kicker">Commerce operations center</span>

            <h1>Orders Intelligence</h1>

            <p>
              Track orders, payments, deliveries, cancellations, customer demand,
              top products, and export clean reports for business decisions.
            </p>
          </div>

          <button className="admin-reset-btn" onClick={exportToExcel}>
            <FileSpreadsheet size={17} />
            Download XLSX
          </button>
        </header>

        {message && <div className="admin-message">{message}</div>}

        <section className="admin-stats-grid">
          <StatCard title="Total Orders" value={stats.total} icon={<Package />} />
          <StatCard title="Pending" value={stats.pending} icon={<Clock3 />} />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle2 />}
          />
          <StatCard
            title="Revenue"
            value={`Ksh ${money(stats.revenue)}`}
            icon={<Wallet />}
          />
        </section>

        <section className="admin-stats-grid">
          <StatCard
            title="Paid Orders"
            value={stats.paid}
            icon={<Wallet />}
          />
          <StatCard
            title="Delivered"
            value={stats.delivered}
            icon={<Truck />}
          />
          <StatCard
            title="Cancelled"
            value={stats.cancelled}
            icon={<XCircle />}
          />
          <StatCard
            title="Pending Value"
            value={`Ksh ${money(stats.pendingRevenue)}`}
            icon={<BarChart3 />}
          />
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Order Filters & Export</h2>

              <p>
                Filter by date, status, payment, customer, phone, product, or
                location before downloading.
              </p>
            </div>

            <button onClick={clearFilters}>Clear Filters</button>
          </div>

          <div
            className="admin-form-grid"
            style={{ gridTemplateColumns: "1.5fr repeat(4, 1fr)" }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "14px",
                  transform: "translateY(-50%)",
                  color: "#8a7568",
                }}
              />

              <input
                type="text"
                placeholder="Search product, customer, email, phone, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "2.8rem" }}
              />
            </div>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All Payments</option>
              <option value="not_paid">Not Paid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="admin-product-actions" style={{ justifyContent: "flex-start" }}>
            <button onClick={exportToExcel}>
              <FileSpreadsheet size={16} />
              Download Excel
            </button>

            <button onClick={exportToCSV}>
              <Download size={16} />
              Download CSV
            </button>

            <button onClick={fetchOrders}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>
        </section>

        <section className="admin-grid" style={{ marginTop: "1.5rem" }}>
          <InsightList
            title="Top Products To Restock"
            icon={<Package />}
            data={topProducts}
            labelKey="product"
            emptyText="No product data yet."
          />

          <InsightList
            title="Top Categories"
            icon={<BarChart3 />}
            data={topCategories}
            labelKey="category"
            emptyText="No category data yet."
          />

          <div className="admin-analytics-card">
            <div className="admin-card-title">
              <Wallet />
              <h3>Business Signal</h3>
            </div>

            <strong style={{ color: "#3b1f14" }}>
              {topProducts[0]?.product || "Waiting for sales data"}
            </strong>

            <p className="admin-empty">
              {topProducts[0]
                ? `${topProducts[0].orders} orders worth Ksh ${money(
                    topProducts[0].value
                  )}. This product deserves more visibility or restock priority.`
                : "Once orders grow, this card will tell the admin what customers are actually buying."}
            </p>
          </div>

          <div className="admin-analytics-card">
            <div className="admin-card-title">
              <Truck />
              <h3>Delivery Load</h3>
            </div>

            <strong style={{ color: "#3b1f14" }}>
              {stats.delivered}/{stats.total}
            </strong>

            <p className="admin-empty">
              Delivered orders compared to total filtered orders.
            </p>
          </div>
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Commerce Orders</h2>

              <p>
                Full operational visibility for WhatsApp checkout commerce.
              </p>
            </div>

            <button onClick={fetchOrders}>
              <RefreshCcw size={16} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="admin-empty">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="admin-empty">No matching orders found.</p>
          ) : (
            <div className="admin-orders-table">
              {filteredOrders.map((order) => (
                <div className="admin-order-row" key={order.id}>
                  <img
                    src={order.product_image || "/vite.svg"}
                    alt={order.product_name}
                  />

                  <div className="admin-order-info">
                    <strong>{order.product_name}</strong>

                    <span>
                      {order.product_category || "Beauty"} • Ksh{" "}
                      {money(order.amount)} • Qty {order.quantity || 1}
                    </span>

                    <small>{formatDate(order.created_at)}</small>

                    <em>
                      {order.customer_name || "Guest Customer"}
                      <br />
                      {order.customer_phone || "No phone"}
                      <br />
                      {order.customer_email || "No email"}
                      <br />
                      {order.delivery_location || "No location"}
                      <br />
                      {order.notes || ""}
                    </em>
                  </div>

                  <select
                    value={order.order_status || "pending"}
                    onChange={(e) =>
                      updateOrder(order.id, {
                        order_status: e.target.value,
                      })
                    }
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <select
                    value={order.payment_status || "not_paid"}
                    onChange={(e) =>
                      updateOrder(order.id, {
                        payment_status: e.target.value,
                      })
                    }
                  >
                    <option value="not_paid">not_paid</option>
                    <option value="paid">paid</option>
                    <option value="refunded">refunded</option>
                  </select>

                  <select
                    value={order.delivery_status || "not_started"}
                    onChange={(e) =>
                      updateOrder(order.id, {
                        delivery_status: e.target.value,
                      })
                    }
                  >
                    <option value="not_started">not_started</option>
                    <option value="processing">processing</option>
                    <option value="delivery_sent">delivery_sent</option>
                    <option value="delivered">delivered</option>
                  </select>

                  <div className="admin-order-badges">
                    <span className={`badge ${order.order_status}`}>
                      {order.order_status}
                    </span>

                    <span className={`badge ${order.payment_status}`}>
                      {order.payment_status}
                    </span>

                    <span className={`badge ${order.delivery_status}`}>
                      {order.delivery_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="admin-stat-card">
      {icon}

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function InsightList({ title, icon, data, labelKey, emptyText }) {
  const highest = data[0]?.orders || 1;

  return (
    <div className="admin-analytics-card">
      <div className="admin-card-title">
        {icon}
        <h3>{title}</h3>
      </div>

      {data.length ? (
        <div className="admin-metric-list">
          {data.map((item) => (
            <div className="admin-metric-item" key={item[labelKey]}>
              <div>
                <span>{item[labelKey]}</span>
                <strong>{item.orders}</strong>
              </div>

              <div className="admin-progress">
                <span style={{ width: `${(item.orders / highest) * 100}%` }} />
              </div>

              <small style={{ color: "#8a7568", fontWeight: 800 }}>
                Qty {item.quantity || item.orders} • Ksh {money(item.value)}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-empty">{emptyText}</p>
      )}
    </div>
  );
}

export default Orders;