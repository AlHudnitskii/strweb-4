import React, { useState, useCallback } from "react";
import axiosInstance from "../axiosInstance";

// Функциональный компонент с декларативной функцией и useCallback
function ProductRecognizer({ onProductRecognized, onError }) {
  const [recognizing, setRecognizing] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Обработчик выбора файла с useCallback для оптимизации
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Валидация типа файла
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    // Валидация размера файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Размер файла не должен превышать 5MB");
      return;
    }

    setSelectedImage(file);

    // Создание превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Обработчик распознавания продукта с useCallback
  const handleRecognize = useCallback(async () => {
    if (!selectedImage) {
      alert("Пожалуйста, выберите изображение");
      return;
    }

    setRecognizing(true);
    setResult(null);

    try {
      // Конвертация файла в base64
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result;
          
          const response = await axiosInstance.post("/api/ai/recognize-product", {
            imageBase64: base64Image,
          });

          setResult(response.data);
          
          // Вызов callback если передан
          if (onProductRecognized) {
            onProductRecognized(response.data);
          }
        } catch (error) {
          console.error("Ошибка распознавания:", error);
          const errorMessage = error.response?.data?.error || "Ошибка при распознавании изображения";
          
          if (onError) {
            onError(errorMessage);
          } else {
            alert(errorMessage);
          }
        } finally {
          setRecognizing(false);
        }
      };

      reader.onerror = () => {
        setRecognizing(false);
        const errorMsg = "Ошибка чтения файла";
        if (onError) {
          onError(errorMsg);
        } else {
          alert(errorMsg);
        }
      };

      reader.readAsDataURL(selectedImage);
    } catch (error) {
      setRecognizing(false);
      console.error("Ошибка:", error);
    }
  }, [selectedImage, onProductRecognized, onError]);

  // Обработчик очистки
  const handleClear = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
  }, []);

  return (
    <div className="product-recognizer">
      <h3>Распознавание продукта по фото</h3>
      
      <div className="recognizer-controls">
        <label className="file-input-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
            disabled={recognizing}
          />
          <span className="file-input-button">Выбрать изображение</span>
        </label>

        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button
              onClick={handleClear}
              className="clear-button"
              disabled={recognizing}
            >
              Очистить
            </button>
          </div>
        )}

        <button
          onClick={handleRecognize}
          disabled={!selectedImage || recognizing}
          className="recognize-button"
        >
          {recognizing ? "Распознавание..." : "Распознать продукт"}
        </button>
      </div>

      {result && (
        <div className="recognition-results">
          <h4>Результаты распознавания:</h4>
          
          {result.labels && result.labels.length > 0 && (
            <div className="labels-section">
              <strong>Обнаруженные метки:</strong>
              <div className="labels-grid">
                {result.labels.map((label, idx) => (
                  <div key={idx} className="label-item">
                    <span className="label-name">{label.description}</span>
                    <span className="label-score">
                      {(label.score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.bestGuessLabels && result.bestGuessLabels.length > 0 && (
            <div className="best-guess-section">
              <strong>Вероятные продукты:</strong>
              <ul>
                {result.bestGuessLabels.map((label, idx) => (
                  <li key={idx}>{label.label}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductRecognizer;

