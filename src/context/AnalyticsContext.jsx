import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AnalyticsContext = createContext();

const initialAnalytics = {
  quickViews: {},
  orders: {},
  searches: {},
  categoryClicks: {},
  shares: {},
  paymentStarted: {},
  paymentCompleted: {},
};

function buildMetric(events = [], eventType, keyField = "event_key") {
  return events
    .filter((event) => event.event_type === eventType)
    .reduce((acc, event) => {
      const key = event[keyField] || event.event_key;
      if (!key) return acc;

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
}

export function AnalyticsProvider({ children }) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  async function fetchAnalytics() {
    setLoadingAnalytics(true);

    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Analytics fetch error:", error.message);
      setLoadingAnalytics(false);
      return;
    }

    setAnalytics({
      quickViews: buildMetric(data, "quick_view"),
      orders: buildMetric(data, "order_intent"),
      searches: buildMetric(data, "search", "search_term"),
      categoryClicks: buildMetric(data, "category_click"),
      shares: buildMetric(data, "product_share"),
      paymentStarted: buildMetric(data, "payment_started"),
      paymentCompleted: buildMetric(data, "payment_completed"),
    });

    setLoadingAnalytics(false);
  }

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function recordEvent(eventType, payload = {}) {
    const cleanKey =
      payload.event_key ||
      payload.product_name ||
      payload.search_term ||
      payload.category ||
      "unknown";

    const optimisticTypeMap = {
      quick_view: "quickViews",
      order_intent: "orders",
      search: "searches",
      category_click: "categoryClicks",
      product_share: "shares",
      payment_started: "paymentStarted",
      payment_completed: "paymentCompleted",
    };

    const analyticsKey = optimisticTypeMap[eventType];

    if (analyticsKey) {
      setAnalytics((prev) => ({
        ...prev,
        [analyticsKey]: {
          ...prev[analyticsKey],
          [cleanKey]: (prev[analyticsKey]?.[cleanKey] || 0) + 1,
        },
      }));
    }

    const { error } = await supabase.from("analytics_events").insert({
      event_type: eventType,
      event_key: cleanKey,
      product_name: payload.product_name || null,
      category: payload.category || null,
      search_term: payload.search_term || null,
      metadata: payload.metadata || {},
    });

    if (error) {
      console.error("Analytics insert error:", error.message);
    }
  }

  function trackQuickView(productName, metadata = {}) {
    if (!productName) return;

    recordEvent("quick_view", {
      event_key: productName,
      product_name: productName,
      metadata,
    });
  }

  function trackOrder(productName, metadata = {}) {
    if (!productName) return;

    recordEvent("order_intent", {
      event_key: productName,
      product_name: productName,
      metadata,
    });
  }

  function trackShare(productName, metadata = {}) {
    if (!productName) return;

    recordEvent("product_share", {
      event_key: productName,
      product_name: productName,
      metadata,
    });
  }

  function trackSearch(searchTerm, metadata = {}) {
    if (!searchTerm) return;

    const cleanSearch = String(searchTerm).trim().toLowerCase();
    if (!cleanSearch) return;

    recordEvent("search", {
      event_key: cleanSearch,
      search_term: cleanSearch,
      metadata,
    });
  }

  function trackCategoryClick(categoryName, metadata = {}) {
    if (!categoryName) return;

    recordEvent("category_click", {
      event_key: categoryName,
      category: categoryName,
      metadata,
    });
  }

  function trackPaymentStarted(productName, metadata = {}) {
    if (!productName) return;

    recordEvent("payment_started", {
      event_key: productName,
      product_name: productName,
      metadata,
    });
  }

  function trackPaymentCompleted(productName, metadata = {}) {
    if (!productName) return;

    recordEvent("payment_completed", {
      event_key: productName,
      product_name: productName,
      metadata,
    });
  }

  async function resetAnalytics() {
    const { error } = await supabase
      .from("analytics_events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error("Analytics reset error:", error.message);
      return;
    }

    setAnalytics(initialAnalytics);
  }

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        loadingAnalytics,
        fetchAnalytics,
        trackQuickView,
        trackOrder,
        trackShare,
        trackSearch,
        trackCategoryClick,
        trackPaymentStarted,
        trackPaymentCompleted,
        resetAnalytics,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}