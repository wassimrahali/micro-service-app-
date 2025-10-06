# 🧩 Microservices Application Example

A complete microservices-based architecture using **Node.js**, **Express**, **Docker Compose**, and **Prometheus monitoring**.  
This project demonstrates **API Gateway routing**, **service-to-service communication**, **logging**, and **metrics collection**.


<img width="829" height="489" alt="image" src="https://github.com/user-attachments/assets/e2848aad-f8cc-4bec-a93a-503b1bbf0928" />


---

## 🚀 Architecture Overview

### Services
| Service | Port | Database | Description |
|----------|------|-----------|--------------|
| **API Gateway** | 3000 | - | Routes traffic to microservices |
| **User Service** | 3001 | PostgreSQL | Manages users |
| **Order Service** | 3002 | MongoDB | Handles orders and verifies users via User Service |
| **Product Service** | 3003 | MongoDB | Manages products |

Each service runs independently in its own container and exposes its REST API.

---

## 🗂️ Project Structure

```
microservices-app/
│
├─ api-gateway/
│   ├─ index.js
│   ├─ package.json
│   ├─ .env
│
├─ user-service/
│   ├─ index.js
│   ├─ package.json
│   ├─ init.sql
│   ├─ .env
│
├─ order-service/
│   ├─ index.js
│   ├─ package.json
│   ├─ .env
│
├─ product-service/
│   ├─ index.js
│   ├─ package.json
│   ├─ .env
│
└─ docker-compose.yml
```

---

## ⚙️ Environment Configuration

Each service has its own `.env` file:

### Example: `order-service/.env`
```
PORT=3002
DB_HOST=db-order
USER_SERVICE_URL=http://user-service:3001
```

Use `dotenv` to load variables inside Node.js services.

---

## 🐳 Docker Setup

Build and run all services:
```bash
docker-compose up --build
```

After all containers start, access:
- API Gateway → http://localhost:3000  
- User Service → http://localhost:3001  
- Order Service → http://localhost:3002  
- Product Service → http://localhost:3003  

---

## 🧱 Database Initialization

PostgreSQL (User Service) automatically runs `init.sql` to create the `users` table:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE
);
```

MongoDB services create databases dynamically on first write.

---

## 🧩 Example API Usage

### Add Users
```bash
curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com"}'
```

### Add Products
```bash
curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"name":"Laptop","price":1200}'
```

### Add Orders (validates User)
```bash
curl -X POST http://localhost:3000/orders -H "Content-Type: application/json" -d '{"userId":1,"product":"Laptop","quantity":2}'
```

---

## 📊 Monitoring (Prometheus)

Each service exposes `/metrics` endpoint with **Prometheus metrics**:

- Default metrics (CPU, memory, uptime)
- Custom HTTP request duration histograms

Example:
```
http_request_duration_ms_count{method="POST",route="/orders",code="201"} 5
```

Prometheus can scrape metrics from:
```
http://user-service:3001/metrics
http://order-service:3002/metrics
http://product-service:3003/metrics
http://api-gateway:3000/metrics
```

---

## 🧾 Logging

Each service uses **Winston** for structured logging:

- Console + file output (`service-name.log`)
- Logs include timestamp, level, and message
- Example:
  ```
  {"level":"info","message":"Order created: { userId: 1, product: 'Laptop' }","timestamp":"2025-10-06T20:00:00Z"}
  ```

---

## ⚡ Advantages of This Architecture

- **Independent scaling** per service  
- **Fault isolation** — one service down doesn’t affect others  
- **Decentralized data management**  
- **Easy updates** and deployments  
- **Language and database flexibility**  
- **Built-in monitoring and observability**

---

## 📦 Technologies Used

- **Node.js** + **Express**
- **PostgreSQL** / **MongoDB**
- **Docker Compose**
- **Winston** (Logging)
- **Prometheus** (Metrics)
- **Axios**, **dotenv**, **cors**

---

## 🔧 Next Steps (Optional Enhancements)

- Add **API authentication (JWT)**  
- Add **Message broker (RabbitMQ / Kafka)** for async events  
- Deploy to **Kubernetes** for scaling  
- Add **Grafana dashboard** for Prometheus metrics  
- Add **CI/CD pipeline** (GitHub Actions or Jenkins)

---

## 🧠 Author

Built with ❤️ to demonstrate **real-world microservices design** — scalable, monitored, and production-ready.
