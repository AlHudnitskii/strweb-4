import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosInstance";

// Стрелочная функция компонента для умной корзины с рекомендациями
const SmartCart = ({ cartItems, onCartUpdate, onSubstitution, onExpiryAlert, onRestock }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [promoApplied, setPromoApplied] = useState(false);

  // Обработчики используются через props callbacks, но определены для будущего использования

  // Обработчик предупреждения об истечении срока годности
  const handleExpiryAlert = (productId, expiryDate) => {
    if (onExpiryAlert) {
      onExpiryAlert(productId, expiryDate);
    }
    showNotification(`Внимание! Продукт скоро истечет: ${expiryDate}`);
  };

  // Обработчик уведомления о пополнении
  const handleRestock = (productId) => {
    if (onRestock) {
      onRestock(productId);
    }
    showNotification(`Продукт снова в наличии!`);
  };

  // Показать уведомление с автоскрытием через setTimeout
  const showNotification = (message, duration = 5000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);

    // Автоматическое скрытие уведомления через setTimeout
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  // Получение рекомендаций рецептов через Promise цепочку
  const fetchRecipeRecommendations = async () => {
    if (!cartItems || cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoadingRecipes(true);

    try {
      // Создание Promise для получения списка продуктов
      const productsPromise = Promise.resolve(
        cartItems.map((item) => item.product.name)
      );

      // Цепочка Promise с async/await
      const productNames = await productsPromise;

      // Параллельные запросы через Promise.all
      const [recipesResponse] = await Promise.all([
        axiosInstance.post("/api/ai/recipe-recommendations", {
          products: productNames,
        }),
      ]);

      // Обработка результатов
      const recipes = recipesResponse.data.recipes || [];
      
      if (Array.isArray(recipes)) {
        setRecommendations(recipes);
      } else if (typeof recipes === 'string') {
        // Если ответ - строка, пытаемся распарсить JSON
        try {
          const parsed = JSON.parse(recipes);
          setRecommendations(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          setRecommendations([]);
        }
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Ошибка получения рекомендаций:", error);
      setRecommendations([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Автоматическое применение акций к товарам в корзине через setTimeout
  useEffect(() => {
    if (!cartItems || cartItems.length === 0 || promoApplied) return;

    // Задержка перед применением акций (имитация обработки)
    const applyPromoTimer = setTimeout(() => {
      const newDiscounts = [];
      
      cartItems.forEach((item) => {
        // Применение скидки 10% для товаров свыше 1000₽
        if (item.product.price >= 1000 && !appliedDiscounts.find(d => d.productId === item.product._id)) {
          newDiscounts.push({
            productId: item.product._id,
            productName: item.product.name,
            discount: 10,
            originalPrice: item.product.price,
            newPrice: item.product.price * 0.9,
          });
        }
      });

      if (newDiscounts.length > 0) {
        setAppliedDiscounts((prev) => [...prev, ...newDiscounts]);
        setPromoApplied(true);
        showNotification(`Применены акции! Скидка 10% на ${newDiscounts.length} товар(ов)`);
        
        // Сохранение состояния таймера в localStorage
        localStorage.setItem('promoApplied', 'true');
        localStorage.setItem('promoAppliedTime', new Date().toISOString());
      }
    }, 3000); // Задержка 3 секунды

    return () => clearTimeout(applyPromoTimer);
  }, [cartItems, promoApplied, appliedDiscounts]);

  // Проверка состояния таймера из localStorage при загрузке
  useEffect(() => {
    const savedPromo = localStorage.getItem('promoApplied');
    const savedTime = localStorage.getItem('promoAppliedTime');
    
    if (savedPromo === 'true' && savedTime) {
      const promoTime = new Date(savedTime);
      const now = new Date();
      const hoursDiff = (now - promoTime) / (1000 * 60 * 60);
      
      // Если прошло больше 24 часов, сбрасываем акцию
      if (hoursDiff < 24) {
        setPromoApplied(true);
      } else {
        localStorage.removeItem('promoApplied');
        localStorage.removeItem('promoAppliedTime');
      }
    }
  }, []);

  // Проверка на истечение срока годности (имитация)
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) return;

    // Периодическая проверка каждые 30 секунд
    const expiryCheckInterval = setInterval(() => {
      cartItems.forEach((item) => {
        // Имитация проверки срока годности
        const shouldAlert = Math.random() > 0.95; // 5% вероятность
        if (shouldAlert) {
          handleExpiryAlert(item.product._id, "через 2 дня");
        }
      });
    }, 30000);

    return () => clearInterval(expiryCheckInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  // Обработчик получения рецептов
  const handleGetRecipes = () => {
    fetchRecipeRecommendations();
  };

  // Обработчик закрытия уведомления
  const handleCloseNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="smart-cart">
        <h3>Умная корзина</h3>
        <p className="empty-message">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="smart-cart">
      <h3>Умная корзина</h3>

      {/* Уведомления */}
      {notifications.length > 0 && (
        <div className="notifications-container">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification">
              <span>{notification.message}</span>
              <button
                onClick={() => handleCloseNotification(notification.id)}
                className="close-notification-button"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Примененные скидки */}
      {appliedDiscounts.length > 0 && (
        <div className="applied-discounts">
          <h4>Примененные акции:</h4>
          <ul>
            {appliedDiscounts.map((discount, idx) => (
              <li key={idx}>
                {discount.productName}: скидка {discount.discount}% 
                ({discount.originalPrice.toFixed(0)}₽ → {discount.newPrice.toFixed(0)}₽)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Рекомендации рецептов */}
      <div className="recipe-recommendations-section">
        <div className="recipe-header">
          <h4>Рекомендации рецептов на основе ваших покупок</h4>
          <button
            onClick={handleGetRecipes}
            disabled={loadingRecipes}
            className="get-recipes-button"
          >
            {loadingRecipes ? "Загрузка..." : "Получить рецепты"}
          </button>
        </div>

        {loadingRecipes && <p>Загрузка рекомендаций...</p>}

        {recommendations.length > 0 && (
          <div className="recipes-list">
            {recommendations.map((recipe, idx) => (
              <div key={idx} className="recipe-card">
                <h5>{recipe.title || `Рецепт ${idx + 1}`}</h5>
                {recipe.time && (
                  <p className="recipe-time">Время приготовления: {recipe.time}</p>
                )}
                {recipe.difficulty && (
                  <p className="recipe-difficulty">
                    Сложность: {recipe.difficulty}
                  </p>
                )}
                {recipe.description && (
                  <p className="recipe-description">{recipe.description}</p>
                )}
                {recipe.steps && Array.isArray(recipe.steps) && (
                  <ol className="recipe-steps">
                    {recipe.steps.map((step, stepIdx) => (
                      <li key={stepIdx}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Дополнительные функции */}
      <div className="smart-features">
        <button
          onClick={() => handleRestock("demo-product-id")}
          className="restock-button"
        >
          Проверить наличие товаров
        </button>
      </div>
    </div>
  );
};

export default SmartCart;

