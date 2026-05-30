import { Link } from "react-router-dom";
import categories from "../../data/categories";
import "../../styles/categories.css";

function CategoryShowcase() {
  return (
    <section id="categories" className="category-section">
      <div className="container">
        <div className="category-showcase">
          <div className="category-header">
            <span className="section-kicker">Shop your vibe</span>

            <h2>Shop by Category</h2>

            <p>
              Browse beauty essentials by product type and find what fits your
              everyday glow.
            </p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="category-card"
              >
                <div className="category-image-wrap">
                  <img src={category.image} alt={category.name} />
                </div>

                <div className="category-content">
                  <span>{category.tagline}</span>
                  <h3>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;