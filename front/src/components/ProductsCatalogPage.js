import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthContext";

function ProductsCatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchQuery,
          category: selectedCategory,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
        };

        const response = await axiosInstance.get("/api/products", { params });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); 

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert("Please log in to add products to your cart.");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post("/api/cart/add", {
        productId,
        quantity: 1,
      });
      alert("Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(error.response?.data?.error || "Error adding to cart");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  if (loading && products.length === 0) {
    return (
      <div className="container">
        <h2>Product Catalog</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Product Catalog</h2>

      {/* Categories Section */}
      {categories.length > 0 && (
        <div className="categories-section">
          <h3 className="categories-title">Категории продуктов</h3>
          <div className="categories-grid">
            <button
              className={`category-chip ${selectedCategory === "" ? "active" : ""}`}
              onClick={() => setSelectedCategory("")}
            >
              Все категории
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`category-chip ${selectedCategory === cat._id ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters and search */}
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label">Поиск</label>
          <input
            type="text"
            placeholder="Поиск продуктов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Категория</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Цена</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="price-input"
            />
            <span className="price-separator">—</span>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="price-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Сортировка</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="createdAt">По дате добавления</option>
            <option value="price">По цене</option>
            <option value="name">По названию</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Порядок</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="filter-select"
          >
            <option value="asc">По возрастанию</option>
            <option value="desc">По убыванию</option>
          </select>
        </div>

        <button onClick={handleResetFilters} className="reset-button">
          Сбросить фильтры
        </button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="empty-state">
          <h3>Продукты не найдены</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
          <button onClick={handleResetFilters} className="reset-button">
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <div className="no-image">No image</div>
                )}
                {product.featured && <span className="featured-badge">Popular</span>}
                {product.discountPrice && (
                  <span className="discount-badge">
                    -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                  </span>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-description">
                  {product.description.substring(0, 100)}
                  {product.description.length > 100 ? "..." : ""}
                </p>

                <div className="product-rating">
                  Рейтинг: {product.rating.toFixed(1)} ({product.reviewsCount} отзывов)
                </div>

                <div className="product-price">
                  {product.discountPrice ? (
                    <>
                      <span className="original-price">{product.price.toLocaleString()} ₽</span>
                      <span className="discount-price">{product.discountPrice.toLocaleString()} ₽</span>
                    </>
                  ) : (
                    <span className="price">{product.price.toLocaleString()} ₽</span>
                  )}
                </div>

                <div className="product-stock">
                  {product.stock > 0 ? (
                    <span className="in-stock">In stock: {product.stock} pcs.</span>
                  ) : (
                    <span className="out-of-stock">Out of stock</span>
                  )}
                </div>

                <div className="product-actions">
                  <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="view-button"
                  >
                    Details
                  </button>
                  {product.stock > 0 && (
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="add-to-cart-button"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductsCatalogPage;