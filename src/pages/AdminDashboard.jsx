import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Eye,
  Heart,
  ImagePlus,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Truck,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import { useAnalytics } from "../context/AnalyticsContext";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  category: "Lip Care",
  stock: "Available",
  badge: "",
  description: "",
  featured: false,
  newArrival: true,
  image_url: "",
  image_urls: [],
};

function sortMetrics(metric = {}, limit = 5) {
  return Object.entries(metric || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function totalMetric(metric = {}) {
  return Object.values(metric || {}).reduce((total, value) => total + value, 0);
}

function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatMoney(value) {
  return `Ksh ${Number(value || 0).toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "Not recorded";
  return new Date(date).toLocaleString();
}

function buildWishlistMetrics(items = []) {
  return items.reduce((acc, item) => {
    const key = item.product_name || "Unknown product";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { analytics, loadingAnalytics, fetchAnalytics, resetAnalytics } =
    useAnalytics();

  const [products, setProducts] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const quickViews = sortMetrics(analytics.quickViews);
  const orderIntents = sortMetrics(analytics.orders);
  const searches = sortMetrics(analytics.searches);
  const categoryClicks = sortMetrics(analytics.categoryClicks);
  const shares = sortMetrics(analytics.shares);
  const paymentStarted = sortMetrics(analytics.paymentStarted);
  const paymentCompleted = sortMetrics(analytics.paymentCompleted);

  const wishlistMetrics = useMemo(
    () => buildWishlistMetrics(wishlistItems),
    [wishlistItems]
  );

  const mostWishlisted = useMemo(
    () => sortMetrics(wishlistMetrics, 5),
    [wishlistMetrics]
  );

  const totalQuickViews = totalMetric(analytics.quickViews);
  const totalOrderIntents = totalMetric(analytics.orders);
  const totalSearches = totalMetric(analytics.searches);
  const totalShares = totalMetric(analytics.shares);
  const totalPaymentStarted = totalMetric(analytics.paymentStarted);
  const totalPaymentCompleted = totalMetric(analytics.paymentCompleted);
  const totalWishlist = wishlistItems.length;

  const liveProducts = useMemo(
    () => products.filter((product) => product.is_published),
    [products]
  );

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products]
  );

  const newArrivalProducts = useMemo(
    () => products.filter((product) => product.new_arrival),
    [products]
  );

  const pendingOrders = useMemo(
    () => ordersList.filter((order) => order.order_status === "pending"),
    [ordersList]
  );

  const confirmedOrders = useMemo(
    () => ordersList.filter((order) => order.order_status === "confirmed"),
    [ordersList]
  );

  const completedOrders = useMemo(
    () => ordersList.filter((order) => order.order_status === "completed"),
    [ordersList]
  );

  const cancelledOrders = useMemo(
    () => ordersList.filter((order) => order.order_status === "cancelled"),
    [ordersList]
  );

  const paidOrders = useMemo(
    () => ordersList.filter((order) => order.payment_status === "paid"),
    [ordersList]
  );

  const deliveredOrders = useMemo(
    () => ordersList.filter((order) => order.delivery_status === "delivered"),
    [ordersList]
  );

  const totalRevenue = paidOrders.reduce(
    (total, order) => total + Number(order.amount || 0),
    0
  );

  const pendingRevenue = pendingOrders.reduce(
    (total, order) => total + Number(order.amount || 0),
    0
  );

  const wishlistValue = wishlistItems.reduce(
    (total, item) => total + Number(item.price || 0),
    0
  );

  const funnelDropOff = Math.max(totalOrderIntents - totalPaymentCompleted, 0);
  const shareToOrderRate = percentage(totalOrderIntents, totalShares);
  const wishlistToOrderRate = percentage(totalOrderIntents, totalWishlist);
  const realOrderConversion = percentage(ordersList.length, totalOrderIntents);
  const paymentCompletionRate = percentage(paidOrders.length, ordersList.length);

  async function fetchProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  }

  async function fetchOrders() {
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error.message);
      setMessage(error.message);
      setOrdersList([]);
    } else {
      setOrdersList(data || []);
    }

    setLoadingOrders(false);
  }

  async function fetchWishlist() {
    setLoadingWishlist(true);

    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist fetch error:", error.message);
      setMessage(error.message);
      setWishlistItems([]);
    } else {
      setWishlistItems(data || []);
    }

    setLoadingWishlist(false);
  }

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchWishlist();
  }, []);

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImagesUpload(e) {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function uploadImages() {
    if (!imageFiles.length) return form.image_urls || [];

    if (!user?.id) {
      throw new Error("Admin user not found. Please login again.");
    }

    const uploadedUrls = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  }

  function validateForm() {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.brand.trim()) return "Brand name is required.";
    if (!form.price || Number(form.price) <= 0) return "Valid price is required.";
    if (!form.category) return "Category is required.";
    if (!form.description.trim()) return "Description is required.";

    const hasOldImage = form.image_url || form.image_urls?.length;
    const hasNewImage = imageFiles.length;

    if (!hasOldImage && !hasNewImage) {
      return "At least one product image is required.";
    }

    return "";
  }

  function resetForm() {
    setForm(emptyForm);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setFormOpen(false);
    setMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const uploadedImageUrls = await uploadImages();
      const finalImageUrls = uploadedImageUrls.length
        ? uploadedImageUrls
        : form.image_urls;

      const mainImage = finalImageUrls[0] || form.image_url;

      const productPayload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Number(String(form.price).replace(/[^\d.]/g, "")),
        category: form.category,
        stock: form.stock,
        badge: form.badge.trim() || form.category,
        description: form.description.trim(),
        image_url: mainImage,
        image_urls: finalImageUrls,
        featured: form.featured,
        new_arrival: form.newArrival,
        is_published: form.stock !== "Unpublished",
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingId);

        if (error) throw error;
        setMessage("Product updated successfully.");
      } else {
        const { error } = await supabase.from("products").insert({
          ...productPayload,
          created_by: user?.id,
        });

        if (error) throw error;
        setMessage("Product posted successfully.");
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(product) {
    const existingImages = product.image_urls?.length
      ? product.image_urls
      : product.image_url
      ? [product.image_url]
      : [];

    setEditingId(product.id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
      category: product.category || "Lip Care",
      stock: product.stock || "Available",
      badge: product.badge || "",
      description: product.description || "",
      featured: Boolean(product.featured),
      newArrival: Boolean(product.new_arrival),
      image_url: product.image_url || "",
      image_urls: existingImages,
    });

    setImagePreviews(existingImages);
    setImageFiles([]);
    setFormOpen(true);
  }

  async function updateProduct(id, updates) {
    const { error } = await supabase
      .from("products")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await fetchProducts();
  }

  async function updateOrder(id, updates) {
    const { error } = await supabase
      .from("orders")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Order update error:", error.message);
      setMessage(error.message);
      return;
    }

    await fetchOrders();
  }

  function updateProductStatus(id, stock) {
    updateProduct(id, {
      stock,
      is_published: stock !== "Unpublished",
    });
  }

  function toggleFeatured(product) {
    updateProduct(product.id, { featured: !product.featured });
  }

  function toggleNewArrival(product) {
    updateProduct(product.id, { new_arrival: !product.new_arrival });
  }

  function togglePublished(product) {
    updateProduct(product.id, {
      is_published: !product.is_published,
      stock: product.is_published ? "Unpublished" : "Available",
    });
  }

  async function deleteProduct(id) {
    const confirmed = window.confirm("Delete this product completely?");
    if (!confirmed) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) setMessage(error.message);
    else fetchProducts();
  }

  async function handleResetAnalytics() {
    const confirmed = window.confirm("Clear all analytics events?");
    if (!confirmed) return;

    await resetAnalytics();
    setMessage("Analytics reset successfully.");
  }

  async function refreshEverything() {
    await Promise.all([fetchProducts(), fetchOrders(), fetchWishlist(), fetchAnalytics()]);
    setMessage("Dashboard refreshed successfully.");
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>TB</span>
          <div>
            <h2>Tranquility</h2>
            <p>Commerce Admin</p>
          </div>
        </div>

        <nav className="admin-menu">
          <button className="active">
            <BarChart3 size={18} /> Command Center
          </button>

          <button onClick={() => setFormOpen(true)}>
            <Package size={18} /> Add Product
          </button>

          <Link to="/orders">
            <ShoppingBag size={18} /> Orders Center
          </Link>

          <button onClick={refreshEverything}>
            <RefreshCw size={18} /> Refresh All
          </button>

          <button onClick={handleResetAnalytics}>
            <X size={18} /> Reset Analytics
          </button>
        </nav>

        <div className="admin-user-card">
          <strong>{user?.name || "Admin User"}</strong>
          <span>{user?.email}</span>
          <small>Admin Access</small>
        </div>

        <button className="admin-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <section className="admin-content">
        <header className="admin-header">
          <div>
            <span className="section-kicker">Real commerce brain</span>
            <h1>Tranquility Beauty Admin ✨</h1>
            <p>
              Manage products, track demand, monitor shares and wishlists,
              control real orders, update payment progress, and understand what
              is turning attention into revenue.
            </p>
          </div>

          <button className="admin-reset-btn" onClick={() => setFormOpen(true)}>
            <Plus size={17} />
            Add Product
          </button>
        </header>

        {message && <div className="admin-message">{message}</div>}

        <section className="admin-stats-grid">
          <StatCard title="Live Products" value={liveProducts.length} icon={<Package />} />
          <StatCard title="Featured" value={featuredProducts.length} icon={<Sparkles />} />
          <StatCard title="New Arrivals" value={newArrivalProducts.length} icon={<TrendingUp />} />
          <StatCard title="Searches" value={totalSearches} icon={<Search />} />
        </section>

        <section className="admin-stats-grid">
          <StatCard title="Quick Views" value={totalQuickViews} icon={<Eye />} />
          <StatCard title="Order Intent" value={totalOrderIntents} icon={<ShoppingBag />} />
          <StatCard title="Product Shares" value={totalShares} icon={<Share2 />} />
          <StatCard title="Wishlist Saves" value={totalWishlist} icon={<Heart />} />
        </section>

        <section className="admin-stats-grid">
          <StatCard title="Revenue" value={formatMoney(totalRevenue)} icon={<WalletCards />} />
          <StatCard title="Pending Orders" value={pendingOrders.length} icon={<Clock3 />} />
          <StatCard title="Wishlist Value" value={formatMoney(wishlistValue)} icon={<Heart />} />
          <StatCard title="Pay Rate" value={`${paymentCompletionRate}%`} icon={<TrendingUp />} />
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Commerce Operations</h2>
              <p>
                Real order records created from WhatsApp checkout. Update order
                status, payment status, and delivery progress here.
              </p>
            </div>

            <button onClick={fetchOrders}>
              <RefreshCw size={17} />
              {loadingOrders ? "Loading..." : "Refresh Orders"}
            </button>
          </div>

          <div className="admin-stats-grid">
            <StatCard title="Confirmed" value={confirmedOrders.length} icon={<PackageCheck />} />
            <StatCard title="Completed" value={completedOrders.length} icon={<CheckCircle2 />} />
            <StatCard title="Cancelled" value={cancelledOrders.length} icon={<XCircle />} />
            <StatCard title="Delivered" value={deliveredOrders.length} icon={<Truck />} />
          </div>

          {loadingOrders ? (
            <p className="admin-empty">Loading orders...</p>
          ) : ordersList.length ? (
            <div className="admin-orders-table">
              {ordersList.slice(0, 6).map((order) => (
                <div className="admin-order-row" key={order.id}>
                  <img src={order.product_image || "/vite.svg"} alt={order.product_name} />

                  <div className="admin-order-info">
                    <strong>{order.product_name}</strong>
                    <span>
                      {order.product_category || "Product"} • {formatMoney(order.amount)}
                    </span>
                    <small>{formatDate(order.created_at)}</small>
                    {order.customer_email && <em>{order.customer_email}</em>}
                    {order.delivery_location && <em>Deliver to: {order.delivery_location}</em>}
                  </div>

                  <select
                    value={order.order_status || "pending"}
                    onChange={(e) => updateOrder(order.id, { order_status: e.target.value })}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <select
                    value={order.payment_status || "not_paid"}
                    onChange={(e) => updateOrder(order.id, { payment_status: e.target.value })}
                  >
                    <option value="not_paid">not_paid</option>
                    <option value="paid">paid</option>
                    <option value="refunded">refunded</option>
                  </select>

                  <select
                    value={order.delivery_status || "not_started"}
                    onChange={(e) => updateOrder(order.id, { delivery_status: e.target.value })}
                  >
                    <option value="not_started">not_started</option>
                    <option value="processing">processing</option>
                    <option value="delivery_sent">delivery_sent</option>
                    <option value="delivered">delivered</option>
                  </select>

                  <div className="admin-order-badges">
                    <span className={`badge ${order.order_status}`}>{order.order_status}</span>
                    <span className={`badge ${order.payment_status}`}>{order.payment_status}</span>
                    <span className={`badge ${order.delivery_status}`}>{order.delivery_status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty">No real customer orders yet.</p>
          )}
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Wishlist Intelligence</h2>
              <p>
                Wishlist shows what customers want before they buy. This is your
                restock, promotion, and WhatsApp-status weapon.
              </p>
            </div>

            <button onClick={fetchWishlist}>
              <RefreshCw size={17} />
              {loadingWishlist ? "Loading..." : "Refresh Wishlist"}
            </button>
          </div>

          <div className="admin-grid">
            <AnalyticsCard
              title="Most Wishlisted Products"
              icon={<Heart size={18} />}
              data={mostWishlisted}
              emptyText="No wishlist saves yet."
            />

            <InsightCard
              title="Wishlist Leader"
              value={mostWishlisted[0]?.[0] || "Waiting for saves"}
              note={
                mostWishlisted[0]
                  ? `${mostWishlisted[0][1]} saves. Promote this product before customers forget it.`
                  : "Saved products will reveal buyer desire before checkout."
              }
            />

            <InsightCard
              title="Wishlist Value"
              value={formatMoney(wishlistValue)}
              note="Estimated value of products customers saved for later."
            />

            <InsightCard
              title="Wishlist → Intent"
              value={`${wishlistToOrderRate}%`}
              note={`${totalOrderIntents} order intents compared against ${totalWishlist} wishlist saves.`}
            />
          </div>

          {wishlistItems.length ? (
            <div className="admin-product-table">
              {wishlistItems.slice(0, 5).map((item) => (
                <div className="admin-product-row" key={item.id}>
                  <img src={item.product_image || "/vite.svg"} alt={item.product_name} />

                  <div>
                    <strong>{item.product_name}</strong>
                    <span>
                      {item.user_email} • {item.product_category || "Beauty"}
                    </span>
                    <small>Saved {formatDate(item.created_at)}</small>
                  </div>

                  <p>{formatMoney(item.price)}</p>

                  <div className="admin-product-actions">
                    <Link to={`/shop?search=${encodeURIComponent(item.product_name)}`}>
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty">No wishlist saves yet.</p>
          )}
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Growth Funnel</h2>
              <p>
                This shows movement from attention to saving, sharing, WhatsApp
                intent, real orders, payment, and completion.
              </p>
            </div>

            <button onClick={fetchAnalytics}>
              <RefreshCw size={17} />
              {loadingAnalytics ? "Loading..." : "Refresh Analytics"}
            </button>
          </div>

          <div className="admin-grid">
            <FunnelCard
              title="View → Intent"
              value={`${percentage(totalOrderIntents, totalQuickViews)}%`}
              description={`${totalOrderIntents} intents from ${totalQuickViews} quick views`}
            />

            <FunnelCard
              title="Share → Intent"
              value={`${shareToOrderRate}%`}
              description={`${totalOrderIntents} intents from ${totalShares} product shares`}
            />

            <FunnelCard
              title="Intent → Real Order"
              value={`${realOrderConversion}%`}
              description={`${ordersList.length} real orders from ${totalOrderIntents} WhatsApp intents`}
            />

            <FunnelCard
              title="Unfinished Intent"
              value={funnelDropOff}
              description="Customers who showed interest but have not completed payment yet"
            />
          </div>
        </section>

        <section className="admin-grid">
          <AnalyticsCard title="Most Viewed Products" icon={<Eye size={18} />} data={quickViews} emptyText="No quick views yet." />
          <AnalyticsCard title="Most Ordered Products" icon={<ShoppingBag size={18} />} data={orderIntents} emptyText="No WhatsApp order clicks yet." />
          <AnalyticsCard title="Most Shared Products" icon={<Share2 size={18} />} data={shares} emptyText="No product shares yet." />
          <AnalyticsCard title="Most Searched Terms" icon={<Search size={18} />} data={searches} emptyText="No searches yet." />
        </section>

        <section className="admin-grid">
          <AnalyticsCard title="Category Demand" icon={<BarChart3 size={18} />} data={categoryClicks} emptyText="No category clicks yet." />
          <AnalyticsCard title="Payment Started" icon={<WalletCards size={18} />} data={paymentStarted} emptyText="No payment starts yet." />
          <AnalyticsCard title="Payment Completed" icon={<BarChart3 size={18} />} data={paymentCompleted} emptyText="No completed payments yet." />

          <InsightCard
            title="Business Recommendation"
            value={
              orderIntents[0]?.[0] ||
              mostWishlisted[0]?.[0] ||
              shares[0]?.[0] ||
              searches[0]?.[0] ||
              "Collecting data"
            }
            note="Use this signal to decide what to restock, feature, advertise, or push on WhatsApp status."
          />
        </section>

        <section className="admin-products-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Product Manager</h2>
              <p>
                Control product status, visibility, featured placement, and new
                arrival placement from one place.
              </p>
            </div>

            <button onClick={() => setFormOpen(true)}>
              <Plus size={17} />
              Add Product
            </button>
          </div>

          {loadingProducts ? (
            <p className="admin-empty">Loading products...</p>
          ) : products.length ? (
            <div className="admin-product-table">
              {products.map((product) => (
                <div className="admin-product-row admin-product-row-advanced" key={product.id}>
                  <img src={product.image_url || "/vite.svg"} alt={product.name} />

                  <div>
                    <strong>{product.name}</strong>
                    <span>
                      {product.brand} • {product.category} • {formatMoney(product.price)}
                    </span>
                    <small>
                      {product.is_published ? "Published" : "Hidden"} •{" "}
                      {product.featured ? "Featured" : "Not featured"} •{" "}
                      {product.new_arrival ? "New arrival" : "Regular"} •{" "}
                      {product.image_urls?.length || 1} image(s)
                    </small>
                  </div>

                  <select
                    value={product.stock || "Available"}
                    onChange={(e) => updateProductStatus(product.id, e.target.value)}
                  >
                    <option>Available</option>
                    <option>Out of Stock</option>
                    <option>Sold</option>
                    <option>Unpublished</option>
                  </select>

                  <div className="admin-product-actions">
                    <button onClick={() => togglePublished(product)}>
                      {product.is_published ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      {product.is_published ? "Live" : "Hidden"}
                    </button>

                    <button onClick={() => toggleFeatured(product)}>
                      {product.featured ? "Unfeature" : "Feature"}
                    </button>

                    <button onClick={() => toggleNewArrival(product)}>
                      {product.new_arrival ? "Old" : "New"}
                    </button>

                    <button onClick={() => startEdit(product)}>Edit</button>

                    <button className="danger" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-empty">No products yet. Add your first product.</p>
          )}
        </section>
      </section>

      {formOpen && (
        <div className="admin-modal-overlay">
          <form className="admin-product-form" onSubmit={handleSubmit}>
            <div className="admin-form-header">
              <div>
                <span className="section-kicker">
                  {editingId ? "Edit product" : "New product"}
                </span>
                <h2>{editingId ? "Update Product" : "Post Product"}</h2>
              </div>

              <button type="button" onClick={resetForm}>
                <X size={18} />
              </button>
            </div>

            <label className="admin-upload-box">
              {imagePreviews.length ? (
                <div className="admin-preview-grid">
                  {imagePreviews.map((src, index) => (
                    <img src={src} alt={`Preview ${index + 1}`} key={`${src}-${index}`} />
                  ))}
                </div>
              ) : (
                <div>
                  <ImagePlus size={32} />
                  <strong>Upload Product Images</strong>
                  <span>You can select more than one image</span>
                </div>
              )}

              <input type="file" accept="image/*" multiple onChange={handleImagesUpload} />
            </label>

            <div className="admin-form-grid">
              <input name="name" placeholder="Product name *" value={form.name} onChange={handleInputChange} required />
              <input name="brand" placeholder="Brand name *" value={form.brand} onChange={handleInputChange} required />
              <input name="price" placeholder="Price e.g. 100 *" value={form.price} onChange={handleInputChange} required />

              <select name="category" value={form.category} onChange={handleInputChange} required>
                <option>Lip Care</option>
                <option>Skincare</option>
                <option>Hair Accessories</option>
                <option>Beauty Tools</option>
                <option>Body Care</option>
                <option>Accessories</option>
                <option>Cute Accessories</option>
              </select>

              <select name="stock" value={form.stock} onChange={handleInputChange}>
                <option>Available</option>
                <option>Out of Stock</option>
                <option>Sold</option>
                <option>Unpublished</option>
              </select>

              <input name="badge" placeholder="Badge e.g. New Stock" value={form.badge} onChange={handleInputChange} />
            </div>

            <textarea
              name="description"
              placeholder="Product description *"
              value={form.description}
              onChange={handleInputChange}
              required
            />

            <div className="admin-check-row">
              <label>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleInputChange} />
                Featured product
              </label>

              <label>
                <input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleInputChange} />
                New arrival
              </label>
            </div>

            <button className="admin-save-product" type="submit" disabled={saving}>
              {saving ? "Saving product..." : editingId ? "Save Changes" : "Post Product"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="admin-stat-card gold">
      {icon}
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function FunnelCard({ title, value, description }) {
  return (
    <div className="admin-analytics-card">
      <div className="admin-card-title">
        <TrendingUp size={18} />
        <h3>{title}</h3>
      </div>
      <strong style={{ fontSize: "2rem", color: "#3b1f14" }}>{value}</strong>
      <p className="admin-empty">{description}</p>
    </div>
  );
}

function InsightCard({ title, value, note }) {
  return (
    <div className="admin-analytics-card">
      <div className="admin-card-title">
        <Sparkles size={18} />
        <h3>{title}</h3>
      </div>
      <strong style={{ display: "block", color: "#3b1f14", marginBottom: "0.6rem" }}>
        {value}
      </strong>
      <p className="admin-empty">{note}</p>
    </div>
  );
}

function AnalyticsCard({ title, icon, data, emptyText }) {
  const highest = data[0]?.[1] || 1;

  return (
    <div className="admin-analytics-card">
      <div className="admin-card-title">
        {icon}
        <h3>{title}</h3>
      </div>

      {data.length ? (
        <div className="admin-metric-list">
          {data.map(([name, count]) => (
            <div className="admin-metric-item" key={name}>
              <div>
                <span>{name}</span>
                <strong>{count}</strong>
              </div>

              <div className="admin-progress">
                <span style={{ width: `${(count / highest) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-empty">{emptyText}</p>
      )}
    </div>
  );
}

export default AdminDashboard;
