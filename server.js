
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 4000;

// Middleware to parse JSON
app.use(express.json({ limit: '50mb' }));

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('PoseidonVest API Server is Running');
});

// Dummy Auth Routes to prevent 404s if UI is used
app.post('/api/auth/login', (req, res) => {
    res.json({ user: { id: 1, email: req.body.email } });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ user: { id: 1, email: req.body.email } });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Proxy Server running on http://localhost:${PORT}`);
});
