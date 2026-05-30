import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "../../context/AnalyticsContext";
import "../../styles/searchbar.css";

function SearchBar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { trackSearch } = useAnalytics();

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanSearch = search.trim();

    if (!cleanSearch) {
      navigate("/shop");
      return;
    }

    trackSearch(cleanSearch);
    navigate(`/shop?search=${encodeURIComponent(cleanSearch)}`);
    setSearch("");
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button type="submit">Search</button>
    </form>
  );
}

export default SearchBar;