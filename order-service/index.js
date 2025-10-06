const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const client = require('prom-client'); // move to top

const app = express();
app.use(express.json());
app.use(cors());

// === Prometheus setup ===
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'order_service_' }); // add prefix for clarity

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'order_service_http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 1000]
});

// Middleware to measure request duration
app.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
    });
    next();
});

// === Database setup ===
mongoose.connect('mongodb://db-order:27017/ordersdb');

// === Order model ===
const orderSchema = new mongoose.Schema({
    userId: Number,
    product: String,
    quantity: Number
});
const Order = mongoose.model('Order', orderSchema);

// === Routes ===
app.get('/orders', async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

app.post('/orders', async (req, res) => {
    const { userId, product, quantity } = req.body;

    try {
        const userResponse = await axios.get('http://user-service:3001/users');
        const userExists = userResponse.data.find(u => u.id === userId);
        if (!userExists) {
            return res.status(400).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error('Error reaching User Service:', err.message);
        return res.status(500).json({ error: 'Cannot reach User Service' });
    }

    const order = new Order({ userId, product, quantity });
    await order.save();
    res.status(201).json(order);
});

// === Metrics endpoint (must come after Prometheus setup) ===
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

// === Start service ===
app.listen(3002, () => console.log('✅ Order Service running on port 3002'));
