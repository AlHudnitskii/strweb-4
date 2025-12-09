import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosInstance";
import { AuthContext } from "../AuthContext";
import DateTimeDisplay from "./DateTimeDisplay";
import ProductRecognizer from "./ProductRecognizer";

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [recognizing, setRecognizing] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axiosInstance.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Ошибка загрузки продукта:", error);
      alert("Продукт не найден");
      navigate("/catalog");
    } finally {
      setLoading(false);
    }
  };

  // Распознавание продукта с помощью Google Vision AI
  const handleRecognizeProduct = async () => {
    if (!product.images || !product.images[0]) {
      alert("У продукта нет изображения для распознавания");
      return;
    }

    setRecognizing(true);
    try {
      const response = await axiosInstance.post("/api/ai/recognize-product", {
        imageUrl: product.images[0],
      });
      setRecognitionResult(response.data);
    } catch (error) {
      console.error("Ошибка распознавания:", error);
      alert("Ошибка при распознавании изображения");
    } finally {
      setRecognizing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post("/api/cart/add", {
        productId: product._id,
        quantity,
      });
      alert("Товар добавлен в корзину");
      navigate("/cart");
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      alert(error.response?.data?.error || "Ошибка добавления в корзину");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      alert("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    try {
      await axiosInstance.post("/api/cart/add", {
        productId: product._id,
        quantity,
      });
      navigate("/checkout");
    } catch (error) {
      console.error("Ошибка:", error);
      alert(error.response?.data?.error || "Ошибка");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <h2>Продукт не найден</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <button onClick={() => navigate("/catalog")} className="back-button">
        ← Назад к каталогу
      </button>

      <div className="product-detail">
        <div className="product-detail-images">
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0]} alt={product.name} className="main-image" />
          ) : (
            <div className="no-image-large">Нет изображения</div>
          )}
          
          {user && product.images && product.images[0] && (
            <button 
              onClick={handleRecognizeProduct} 
              disabled={recognizing}
              className="recognize-button"
            >
              {recognizing ? "Распознавание..." : "Распознать с помощью AI"}
            </button>
          )}

          {recognitionResult && (
            <div className="recognition-result">
              <h4>Результаты распознавания:</h4>
              <div className="labels">
                <strong>Метки:</strong>
                {recognitionResult.labels.slice(0, 5).map((label, idx) => (
                  <span key={idx} className="label-tag">
                    {label.description} ({(label.score * 100).toFixed(1)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          
          {product.brand && <p className="brand">Бренд: {product.brand}</p>}
          
          <div className="rating">
            Рейтинг: {product.rating.toFixed(1)} ({product.reviewsCount} отзывов)
          </div>

          <div className="price-section">
            {product.discountPrice ? (
              <>
                <span className="original-price">{product.price.toLocaleString()} ₽</span>
                <span className="discount-price">{product.discountPrice.toLocaleString()} ₽</span>
                <span className="discount-percent">
                  -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="price">{product.price.toLocaleString()} ₽</span>
            )}
          </div>

          <div className="stock-info">
            {product.stock > 0 ? (
              <span className="in-stock">✓ В наличии: {product.stock} шт.</span>
            ) : (
              <span className="out-of-stock">✗ Нет в наличии</span>
            )}
          </div>

          {product.stock > 0 && (
            <>
              <div className="quantity-selector">
                <label>Количество:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    min="1"
                    max={product.stock}
                    className="quantity-input"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="action-buttons">
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                  Добавить в корзину
                </button>
                <button onClick={handleBuyNow} className="buy-now-btn">
                  Купить сейчас
                </button>
              </div>
            </>
          )}

          <div className="description">
            <h3>Описание</h3>
            <p>{product.description}</p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="tags">
              <strong>Теги:</strong>
              {product.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="product-meta">
            <p><strong>Категория:</strong> {product.category?.name}</p>
            {product.sku && <p><strong>Артикул:</strong> {product.sku}</p>}
            
            {/* Отображение дат создания и обновления в локальной таймзоне и UTC */}
            <DateTimeDisplay date={product.createdAt} label="Дата добавления" />
            {product.updatedAt && (
              <DateTimeDisplay date={product.updatedAt} label="Дата изменения" />
            )}
          </div>

          {/* Компонент распознавания продуктов для авторизованных пользователей */}
          {user && (
            <div className="product-recognizer-section">
              <ProductRecognizer
                onProductRecognized={(result) => {
                  console.log("Продукт распознан:", result);
                }}
                onError={(error) => {
                  console.error("Ошибка распознавания:", error);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;