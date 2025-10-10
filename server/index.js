const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// ✅ CORS
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'https://localhost:5173'];

const commonFrontendPlatforms = [
  'https://*.vercel.app',
  'https://*.netlify.app',
  'https://*.railway.app',
  'https://*.render.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      const isAllowedPlatform = commonFrontendPlatforms.some(platform => {
        const regex = new RegExp(platform.replace('*', '.*'));
        return regex.test(origin);
      });

      if (isAllowedPlatform) {
        return callback(null, true);
      }

      console.error(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// ✅ Helmet Security (Fixed CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "data:"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:"
        ],
        connectSrc: [
          "'self'",
          "*"
        ],
        objectSrc: ["'none'"],
        frameSrc: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ✅ Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ Serve Frontend Build (React)
const clientPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  console.warn('⚠️ Frontend build folder not found. Skipping static serve.');
}

// ✅ Serve Uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (path.endsWith('.js') || path.endsWith('.exe')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// ✅ API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/excel', require('./routes/excelRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ Server running successfully',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
    },
    database: 'Connected',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ✅ Status Page
app.get('/status', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Excel Analytics Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #333;
        }
        .container {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        a {
          text-decoration: none;
          color: #667eea;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🚀 Excel Analytics Backend</h2>
        <p>Server running successfully</p>
        <p><strong>Mode:</strong> ${isProduction ? 'Production' : 'Development'}</p>
        <p><strong>Frontend:</strong> <a href="${frontendUrl}" target="_blank">${frontendUrl}</a></p>
      </div>
    </body>
    </html>
  `);
});

// ✅ Redirect root
app.get('/', (req, res) => res.redirect('/status'));

// ✅ 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: ['/api/auth', '/api/excel', '/api/admin', '/api/health']
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Excel Analytics Backend Server Started!
✅ Port: ${PORT}
🌐 Status: http://localhost:${PORT}/status
🔗 Health: http://localhost:${PORT}/api/health
📊 Environment: ${process.env.NODE_ENV || 'development'}
🌍 Allowed Origins: ${allowedOrigins.join(', ')}
  `);
});
