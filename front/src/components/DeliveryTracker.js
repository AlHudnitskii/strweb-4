import React, { Component } from "react";

// Классовый компонент для отслеживания доставки в реальном времени
class DeliveryTracker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderId: props.orderId || null,
      tracking: false,
      progress: 0,
      currentStatus: "pending",
      courierLocation: null,
      estimatedTime: null,
      statusHistory: [],
      error: null,
    };
    this.xhr = null;
    this.intervalId = null;
  }

  // Обработчик начала отслеживания
  handleStartTracking = () => {
    if (!this.state.orderId) {
      this.setState({ error: "Не указан ID заказа" });
      return;
    }

    this.setState({ tracking: true, error: null });
    this.startTracking();
  };

  // Обработчик остановки отслеживания
  handleStopTracking = () => {
    this.stopTracking();
    this.setState({ tracking: false });
  };

  // Обработчик изменения ID заказа
  handleOrderIdChange = (event) => {
    this.setState({ orderId: event.target.value });
  };

  // Запуск отслеживания с использованием XMLHttpRequest
  startTracking = () => {
    // Имитация отслеживания местоположения курьера через XMLHttpRequest
    const trackCourier = () => {
      if (!this.state.tracking) return;

      this.xhr = new XMLHttpRequest();
      
      // Обработчик прогресса загрузки
      this.xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.setState({ progress });
        }
      };

      // Обработчик успешного ответа
      this.xhr.onload = () => {
        if (this.xhr.status === 200) {
          try {
            const data = JSON.parse(this.xhr.responseText);
            this.updateDeliveryStatus(data);
          } catch (error) {
            console.error("Ошибка парсинга ответа:", error);
            // Имитация данных для демонстрации
            this.updateDeliveryStatus(this.generateMockData());
          }
        } else {
          // Имитация данных при ошибке для демонстрации
          this.updateDeliveryStatus(this.generateMockData());
        }
      };

      // Обработчик ошибки
      this.xhr.onerror = () => {
        // Имитация данных при ошибке для демонстрации
        this.updateDeliveryStatus(this.generateMockData());
      };

      // Открытие запроса (имитация API отслеживания)
      // В реальном приложении здесь был бы реальный endpoint
      this.xhr.open("GET", `/api/delivery/track/${this.state.orderId}`, true);
      
      // Установка таймаута
      this.xhr.timeout = 5000;
      this.xhr.ontimeout = () => {
        // Имитация данных при таймауте
        this.updateDeliveryStatus(this.generateMockData());
      };

      // Отправка запроса
      try {
        this.xhr.send();
      } catch (error) {
        // Имитация данных для демонстрации
        this.updateDeliveryStatus(this.generateMockData());
      }
    };

    // Первый запрос сразу
    trackCourier();

    // Периодические обновления каждые 3 секунды
    this.intervalId = setInterval(() => {
      if (this.state.tracking) {
        trackCourier();
      }
    }, 3000);
  };

  // Генерация моковых данных для демонстрации
  generateMockData = () => {
    const statuses = ["pending", "processing", "packing", "shipped", "in_transit", "delivered"];
    const currentIndex = statuses.indexOf(this.state.currentStatus);
    const nextIndex = Math.min(currentIndex + 1, statuses.length - 1);
    const newStatus = statuses[nextIndex];

    const locations = [
      { lat: 55.7558, lng: 37.6173, address: "Склад, Москва" },
      { lat: 55.7520, lng: 37.6156, address: "Транспортный узел" },
      { lat: 55.7490, lng: 37.6200, address: "По пути к вам" },
      { lat: 55.7510, lng: 37.6180, address: "Приближается" },
      { lat: 55.7550, lng: 37.6170, address: "Ваш адрес" },
    ];

    const locationIndex = Math.min(nextIndex, locations.length - 1);

    return {
      status: newStatus,
      progress: Math.min((nextIndex + 1) * 20, 100),
      courierLocation: locations[locationIndex],
      estimatedTime: nextIndex < statuses.length - 1 ? "15-20 минут" : "Доставлено",
      timestamp: new Date().toISOString(),
    };
  };

  // Обновление статуса доставки
  updateDeliveryStatus = (data) => {
    const statusHistory = [...this.state.statusHistory];
    statusHistory.push({
      status: data.status,
      timestamp: data.timestamp || new Date().toISOString(),
    });

    this.setState({
      currentStatus: data.status,
      progress: data.progress || this.state.progress,
      courierLocation: data.courierLocation,
      estimatedTime: data.estimatedTime,
      statusHistory: statusHistory.slice(-5), // Последние 5 статусов
    });

    // Вызов callback если передан
    if (this.props.onDeliveryTrack) {
      this.props.onDeliveryTrack({
        status: data.status,
        progress: data.progress,
        location: data.courierLocation,
      });
    }

    // Если доставлено, останавливаем отслеживание
    if (data.status === "delivered") {
      setTimeout(() => {
        this.stopTracking();
        this.setState({ tracking: false });
      }, 2000);
    }
  };

  // Остановка отслеживания
  stopTracking = () => {
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  };

  // Очистка при размонтировании
  componentWillUnmount() {
    this.stopTracking();
  }

  // Получение текста статуса
  getStatusText = (status) => {
    const statusMap = {
      pending: "Ожидание",
      processing: "Обработка",
      packing: "Упаковка",
      shipped: "Отправлено",
      in_transit: "В пути",
      delivered: "Доставлено",
    };
    return statusMap[status] || status;
  };

  render() {
    const {
      orderId,
      tracking,
      progress,
      currentStatus,
      courierLocation,
      estimatedTime,
      statusHistory,
      error,
    } = this.state;

    return (
      <div className="delivery-tracker">
        <h3>Отслеживание доставки</h3>

        {!tracking ? (
          <div className="tracker-setup">
            <div className="form-group">
              <label>ID заказа:</label>
              <input
                type="text"
                value={orderId || ""}
                onChange={this.handleOrderIdChange}
                placeholder="Введите ID заказа"
                className="order-id-input"
              />
            </div>
            <button onClick={this.handleStartTracking} className="start-tracking-button">
              Начать отслеживание
            </button>
            {error && <div className="error-message">{error}</div>}
          </div>
        ) : (
          <div className="tracker-active">
            <div className="tracker-header">
              <span className="order-id-display">Заказ #{orderId}</span>
              <button onClick={this.handleStopTracking} className="stop-tracking-button">
                Остановить
              </button>
            </div>

            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">{progress}%</span>
            </div>

            <div className="status-info">
              <div className="current-status">
                <strong>Текущий статус:</strong> {this.getStatusText(currentStatus)}
              </div>
              {estimatedTime && (
                <div className="estimated-time">
                  <strong>Примерное время:</strong> {estimatedTime}
                </div>
              )}
            </div>

            {courierLocation && (
              <div className="courier-location">
                <strong>Местоположение курьера:</strong>
                <div className="location-details">
                  <p>{courierLocation.address}</p>
                  <p className="coordinates">
                    Координаты: {courierLocation.lat.toFixed(4)}, {courierLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            {statusHistory.length > 0 && (
              <div className="status-history">
                <strong>История статусов:</strong>
                <ul>
                  {statusHistory.map((item, idx) => (
                    <li key={idx}>
                      {this.getStatusText(item.status)} -{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default DeliveryTracker;

