import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/environment.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();

// ✅ CRITICAL: Trust proxy for proper IP extraction
app.set('trust proxy', true);

// ✅ FIXED CORS Configuration with x-user-data header
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://prod-client-omega.vercel.app',  // Production frontend
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-user-data'  // ✅ ADDED: Allow x-user-data header
  ],
  optionsSuccessStatus: 200,
  maxAge: 3600,
};

// ✅ CORS MUST BE FIRST
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profiles', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

export default app;
// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import config from './config/environment.js';
// import logger from './utils/logger.js';
// import errorHandler from './middleware/errorHandler.js';
// import userRoutes from './routes/userRoutes.js';
// import profileRoutes from './routes/profileRoutes.js';

// const app = express();

// // ✅ FIXED CORS Configuration with Production URL
// const corsOptions = {
//   origin: (origin, callback) => {
//     const allowedOrigins = [
//       'http://localhost:3000',
     
//       'https://prod-client-omega.vercel.app',  // ✅ ADDED: Production frontend
//     ];

//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],  // Keep as is - simple and clean
//   optionsSuccessStatus: 200,
//   maxAge: 3600,
// };

// // ✅ CORS MUST BE FIRST
// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// app.use(helmet());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Logging
// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.path}`);
//   next();
// });

// // Routes
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/profiles', profileRoutes);

// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'ok',
//     service: 'user-service',
//     timestamp: new Date().toISOString(),
//   });
// });

// // 404
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'Route not found' });
// });

// // Error handler
// app.use(errorHandler);

// export default app;
