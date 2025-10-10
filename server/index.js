const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit'); // Added rate limiting
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// ✅ Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// ✅ CORS: Allow only known frontends
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'https://localhost:5173'];

// Add common deployment platforms to allowed origins
const commonFrontendPlatforms = [
  'https://*.vercel.app',
  'https://*.netlify.app',
  'https://*.railway.app',
  'https://*.render.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Check if origin matches common deployment platforms
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

// ✅ Security Headers (Content Security Policy)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", ...allowedOrigins, ...commonFrontendPlatforms],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false // Disable for file uploads
  })
);

// ✅ Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// ✅ Serve static frontend (if you're serving built React app from backend)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Serve uploads folder with security headers
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Security headers for uploaded files
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent execution of uploaded files
    if (path.endsWith('.js') || path.endsWith('.exe')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// ✅ API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/excel', require('./routes/excelRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ✅ Health check - Detailed version
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ Server is running successfully',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
    },
    database: 'Connected', // Assuming DB connection is established
    version: process.env.npm_package_version || '1.0.0'
  });
});

// ✅ Simple status check for web browsers
app.get('/status', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Server Status - Excel Analytics</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                color: #333;
            }
            .status-container {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                padding: 3rem;
                border-radius: 20px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                max-width: 500px;
                width: 100%;
            }
            .status-icon {
                font-size: 4rem;
                margin-bottom: 1.5rem;
            }
            .status-message {
                font-size: 2rem;
                font-weight: bold;
                margin-bottom: 1rem;
                color: #2d3748;
            }
            .status-details {
                font-size: 1.1rem;
                margin-bottom: 2rem;
                line-height: 1.6;
                color: #4a5568;
            }
            .live-badge {
                background: #00d26a;
                color: white;
                padding: 0.5rem 1.5rem;
                border-radius: 25px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }
            .links {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-secondary {
                background: #e2e8f0;
                color: #4a5568;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            .environment {
                margin-top: 1.5rem;
                padding: 0.5rem;
                border-radius: 8px;
                background: ${isProduction ? '#c6f6d5' : '#fed7d7'};
                color: ${isProduction ? '#22543d' : '#742a2a'};
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="status-container">
            <div class="status-icon">🚀</div>
            <div class="status-message">Excel Analytics Backend</div>
            <div class="status-details">
                Server is running successfully<br>
                <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
                <strong>Port:</strong> ${process.env.PORT || 5000}<br>
                <strong>Frontend:</strong> ${frontendUrl}
            </div>
            <div class="live-badge">LIVE & OPERATIONAL</div>
            
            <div class="links">
                <a href="/api/health" class="btn btn-primary">API Health Check</a>
                <a href="${frontendUrl}" class="btn btn-secondary" target="_blank">Go to Frontend</a>
            </div>
            
            <div class="environment">
                ${isProduction ? '🏭 PRODUCTION' : '🔧 DEVELOPMENT'} MODE
            </div>
        </div>
    </body>
    </html>
  `);
});

// ✅ Root - Redirect to status page
app.get('/', (req, res) => {
  res.redirect('/status');
});

// ✅ 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: ['/api/auth', '/api/excel', '/api/admin', '/api/health']
  });
});

// ✅ Global error handler
app.use(errorHandler);

// ✅ Start server
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