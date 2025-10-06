
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Proxy routes
app.use('/users', createProxyMiddleware({ target: 'http://user-service:3001', changeOrigin: true }));
app.use('/orders', createProxyMiddleware({ target: 'http://order-service:3002', changeOrigin: true }));
app.use('/products', createProxyMiddleware({ target: 'http://product-service:3003', changeOrigin: true }));

app.listen(3000, () => console.log('API Gateway running on 3000'));
