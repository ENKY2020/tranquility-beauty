import {
  CheckCircle2,
  Clock3,
  Heart,
  LogOut,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
  Wallet,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../context/AnalyticsContext";

import "../styles/dashboard.css";

function sortOrders(orders = {}) {
  return Object.entries(orders).sort((a, b) => b[1] - a[1]);
}

function formatMoney(value) {
  return `Ksh ${Number(value || 0).toLocaleString()}`;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { analytics } = useAnalytics();

  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const orderIntents = sortOrders(analytics.orders);

  const totalOrderIntents = orderIntents.reduce(
    (total, [, count]) => total + count,
    0
  );

  async function fetchOrders() {
    if (!user?.email) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setLoadingOrders(false);
  }

  async function fetchWishlist() {
    if (!user?.email) {
      setLoadingWishlist(false);
      return;
    }

    setLoadingWishlist(true);

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_email", user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error.message);
      setWishlist([]);
    } else {
      setWishlist(data || []);
    }

    setLoadingWishlist(false);
  }

  async function removeWishlistItem(id) {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchWishlist();
  }

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
  }, [user?.email]);

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.order_status === "pending" ||
          order.order_status === "confirmed"
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.order_status === "completed" ||
          order.delivery_status === "delivered"
      ),
    [orders]
  );

  const paidOrders = useMemo(
    () => orders.filter((order) => order.payment_status === "paid"),
    [orders]
  );

  const totalSpent = useMemo(
    () =>
      paidOrders.reduce(
        (total, order) => total + Number(order.amount || 0),
        0
      ),
    [paidOrders]
  );

  return (
    <main className="dashboard-page">
      <section className="container dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-profile-card">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name || "User"} />
            ) : (
              <span>{user?.name?.charAt(0) || "U"}</span>
            )}

            <h2>{user?.name || "Beauty User"}</h2>
            <p>{user?.email}</p>

            <small>
              {user?.isAdmin
                ? "Admin Commerce Account"
                : "Customer Beauty Account"}
            </small>
          </div>

          <nav className="dashboard-menu">
            <a href="#dashboard-overview" className="active">
              <User size={18} />
              Dashboard
            </a>

            <a href="#my-orders">
              <ShoppingBag size={18} />
              My Orders
            </a>

            <a href="#wishlist">
              <Heart size={18} />
              Wishlist
            </a>

            <a href="#delivery">
              <MapPin size={18} />
              Delivery Details
            </a>

            {user?.isAdmin && (
              <Link to="/admin">
                <Sparkles size={18} />
                Admin Dashboard
              </Link>
            )}

            <button onClick={logout}>
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <section className="dashboard-content" id="dashboard-overview">
          <div className="dashboard-hero">
            <div>
              <span className="section-kicker">
                Tranquility Beauty Commerce
              </span>

              <h1>Welcome back, {user?.name || "Beauty Lover"} ✨</h1>

              <p>
                Monitor your orders, wishlist, delivery activity, shopping
                behavior, and beauty product interest from one place.
              </p>
            </div>

            <Link to="/shop" className="dashboard-shop-btn">
              Continue Shopping
            </Link>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <ShoppingBag />
              <span>Order Intent</span>
              <strong>{totalOrderIntents}</strong>
            </div>

            <div className="dashboard-stat-card">
              <Clock3 />
              <span>Pending Orders</span>
              <strong>{pendingOrders.length}</strong>
            </div>

            <div className="dashboard-stat-card">
              <Heart />
              <span>Wishlist</span>
              <strong>{wishlist.length}</strong>
            </div>

            <div className="dashboard-stat-card">
              <Wallet />
              <span>Total Spent</span>
              <strong>{formatMoney(totalSpent)}</strong>
            </div>
          </div>

          <div className="dashboard-grid">
            <section className="dashboard-panel" id="my-orders">
              <div className="dashboard-panel-header">
                <div>
                  <h2>My Orders</h2>
                  <span>Real commerce activity</span>
                </div>

                <button onClick={fetchOrders}>Refresh</button>
              </div>

              <div className="dashboard-orders">
                {loadingOrders ? (
                  <p className="dashboard-empty">Loading your orders...</p>
                ) : orders.length ? (
                  orders.map((order) => (
                    <div className="dashboard-order-row" key={order.id}>
                      <div className="dashboard-order-main">
                        <img
                          src={order.product_image || "/vite.svg"}
                          alt={order.product_name}
                        />

                        <div>
                          <strong>{order.product_name}</strong>

                          <span>
                            {formatMoney(order.amount)} • Qty{" "}
                            {order.quantity || 1}
                          </span>

                          {order.delivery_location && (
                            <span>Deliver to: {order.delivery_location}</span>
                          )}

                          <small>
                            {new Date(order.created_at).toLocaleString()}
                          </small>
                        </div>
                      </div>

                      <div className="dashboard-order-statuses">
                        <em className={order.order_status}>
                          {order.order_status}
                        </em>

                        <em className={order.payment_status}>
                          {order.payment_status}
                        </em>

                        <em className={order.delivery_status}>
                          {order.delivery_status}
                        </em>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty">
                    No real orders yet. Once you checkout through WhatsApp, your
                    pending orders will appear here.
                  </p>
                )}
              </div>
            </section>

            <section className="dashboard-panel" id="wishlist">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Wishlist</h2>
                  <span>Saved for later</span>
                </div>

                <button onClick={fetchWishlist}>Refresh</button>
              </div>

              <div className="dashboard-orders">
                {loadingWishlist ? (
                  <p className="dashboard-empty">Loading wishlist...</p>
                ) : wishlist.length ? (
                  wishlist.map((item) => (
                    <div className="dashboard-order-row" key={item.id}>
                      <div className="dashboard-order-main">
                        <img
                          src={item.product_image || "/vite.svg"}
                          alt={item.product_name}
                        />

                        <div>
                          <strong>{item.product_name}</strong>
                          <span>
                            {item.product_category || "Beauty"} •{" "}
                            {formatMoney(item.price)}
                          </span>
                          <small>
                            Saved{" "}
                            {new Date(item.created_at).toLocaleString()}
                          </small>
                        </div>
                      </div>

                      <div className="dashboard-order-statuses">
                        <Link
                          to={`/shop?search=${encodeURIComponent(
                            item.product_name
                          )}`}
                          className="dashboard-mini-btn"
                        >
                          View
                        </Link>

                        <button
                          className="dashboard-mini-btn danger"
                          onClick={() => removeWishlistItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty">
                    No wishlist items yet. Tap the heart on any product to save
                    it for later.
                  </p>
                )}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-header">
                <h2>Beauty Intelligence</h2>
                <span>Your shopping signals</span>
              </div>

              <div className="dashboard-orders">
                {orderIntents.length ? (
                  orderIntents.map(([productName, count]) => (
                    <div className="dashboard-order-row" key={productName}>
                      <div>
                        <strong>{productName}</strong>
                        <span>
                          {count} WhatsApp{" "}
                          {count === 1 ? "click" : "clicks"}
                        </span>
                      </div>

                      <em className="pending">Interested</em>
                      <p>{count}</p>
                    </div>
                  ))
                ) : (
                  <p className="dashboard-empty">
                    Shopping analytics will appear here as you interact with
                    products.
                  </p>
                )}
              </div>
            </section>

            <section className="dashboard-panel" id="delivery">
              <div className="dashboard-panel-header">
                <h2>Account Overview</h2>
                <span>Profile & delivery</span>
              </div>

              <div className="dashboard-account-list">
                <div>
                  <User size={18} />

                  <span>
                    <strong>Profile</strong>
                    {user?.email || "Signed in customer account"}
                  </span>
                </div>

                <div>
                  <MapPin size={18} />

                  <span>
                    <strong>Delivery</strong>
                    Delivery locations are captured during checkout and shown in
                    each order.
                  </span>
                </div>

                <div>
                  <Truck size={18} />

                  <span>
                    <strong>Commerce Engine</strong>
                    Orders, payment stages, and delivery flow are connected to
                    the real commerce system.
                  </span>
                </div>

                <div>
                  <PackageCheck size={18} />

                  <span>
                    <strong>Wishlist Signal</strong>
                    Saved products help Tranquility Beauty know what customers
                    want before they buy.
                  </span>
                </div>
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Dashboard;