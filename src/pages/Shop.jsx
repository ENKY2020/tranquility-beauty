import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { supabase } from "../lib/supabaseClient";
import ProductCard from "../components/common/ProductCard";
import ProductQuickView from "../components/common/ProductQuickView";
import { useAnalytics } from "../context/AnalyticsContext";
import "../styles/shop.css";

function normalizeProduct(product) {
  const priceNumber = Number(product.price || 0);

  return {
    ...product,
    image: product.image_url,
    images: product.image_urls?.length ? product.image_urls : [product.image_url],
    price: `Ksh ${priceNumber}`,
    priceNumber,
    newArrival: product.new_arrival,
    rating: product.rating || "4.9",
  };
}

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackSearch, trackCategoryClick } = useAnalytics();

  const categoryFromUrl = searchParams.get("category") || "All";
  const searchFromUrl = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [sortMode, setSortMode] = useState("newest");

  const lastTrackedSearch = useRef("");

  useEffect(() => {
    async function fetchProducts() {
      setLoadingProducts(true);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .not("stock", "eq", "Unpublished")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Shop products fetch error:", error.message);
        setProducts([]);
      } else {
        setProducts((data || []).map(normalizeProduct));
      }

      setLoadingProducts(false);
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const productCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return ["All", ...new Set(productCategories)];
  }, [products]);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    setActiveCategory(categories.includes(categoryFromUrl) ? categoryFromUrl : "All");
  }, [categoryFromUrl, categories]);

  function updateUrlParams({ category, search }) {
    const nextParams = {};

    if (category && category !== "All") nextParams.category = category;
    if (search && search.trim()) nextParams.search = search.trim();

    setSearchParams(nextParams);
  }

  function handleCategoryChange(category) {
    setActiveCategory(category);

    if (category !== "All") {
      trackCategoryClick(category);
    }

    updateUrlParams({ category, search: searchTerm });
  }

  function handleSearchChange(value) {
    setSearchTerm(value);
    updateUrlParams({ category: activeCategory, search: value });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();

    const cleanSearch = searchTerm.trim().toLowerCase();

    if (cleanSearch && cleanSearch !== lastTrackedSearch.current) {
      trackSearch(cleanSearch);
      lastTrackedSearch.current = cleanSearch;
    }

    updateUrlParams({ category: activeCategory, search: searchTerm });
  }

  function clearFilters() {
    setSearchTerm("");
    setActiveCategory("All");
    setSortMode("newest");
    setSearchParams({});
  }

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !cleanSearch ||
        product.name?.toLowerCase().includes(cleanSearch) ||
        product.brand?.toLowerCase().includes(cleanSearch) ||
        product.category?.toLowerCase().includes(cleanSearch) ||
        product.description?.toLowerCase().includes(cleanSearch) ||
        product.badge?.toLowerCase().includes(cleanSearch);

      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "price-low") return a.priceNumber - b.priceNumber;
      if (sortMode === "price-high") return b.priceNumber - a.priceNumber;
      if (sortMode === "featured") return Number(b.featured) - Number(a.featured);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [products, searchTerm, activeCategory, sortMode]);

  const featuredCount = products.filter((product) => product.featured).length;
  const newArrivalCount = products.filter((product) => product.newArrival).length;

  return (
    <main className="shop-page">
      <section className="container shop-hero">
        <span className="section-kicker">Tranquility Beauty Store</span>
        <h1>Shop Beauty & Self-Care Essentials</h1>
        <p>
          Browse real products from Tranquility Beauty, filter by category, search
          by need, and order directly through WhatsApp.
        </p>

        <div className="shop-hero-stats">
          <span>{products.length} Products</span>
          <span>{featuredCount} Featured</span>
          <span>{newArrivalCount} New Arrivals</span>
        </div>
      </section>

      <section className="container shop-controls">
        <form className="shop-search-box" onSubmit={handleSearchSubmit}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search product, brand, category..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => handleSearchChange("")}>
              <X size={16} />
            </button>
          )}
        </form>

        <div className="shop-sort-box">
          <SlidersHorizontal size={17} />
          <select value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="featured">Featured first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>

        <div className="shop-category-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "active" : ""}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="container shop-grid-section">
        <div className="shop-section-header">
          <div>
            <span className="section-kicker">
              {activeCategory === "All" ? "All categories" : activeCategory}
            </span>

            <h2>
              {searchTerm
                ? `Search results for "${searchTerm}"`
                : activeCategory === "All"
                ? "All Products"
                : activeCategory}
            </h2>

            <p>
              {loadingProducts
                ? "Loading products..."
                : `${filteredProducts.length} product${
                    filteredProducts.length === 1 ? "" : "s"
                  } available`}
            </p>
          </div>

          {(searchTerm || activeCategory !== "All" || sortMode !== "newest") && (
            <button type="button" className="clear-filters-btn" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {loadingProducts ? (
          <div className="shop-products-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="product-card product-card-skeleton" key={item} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="shop-products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-shop-state">
            <h3>No products found</h3>
            <p>Try another search or clear filters to view all products.</p>
            <button type="button" onClick={clearFilters}>
              View all products
            </button>
          </div>
        )}
      </section>

      <ProductQuickView
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}

export default Shop;