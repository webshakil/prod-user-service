import * as dotenv from 'dotenv';
dotenv.config();

// ✅ CORS Configuration
const getCORSConfig = () => {
  const allowedOrigins = [
    'http://localhost:3000',      // Frontend Vite
    'http://localhost:5173',      // Frontend Vite (alternative port)
    'http://localhost:4173',      // Frontend Preview
    'http://localhost:3001',      // Auth Service
    'http://localhost:3002',      // User Service
    'http://localhost:3003',      // Subscription Service
    'http://localhost:3004',      // Role Service
    'http://localhost:3005',      // Election Service
  ];

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200,
    maxAge: 3600,
  };
};

export default {
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  serviceName: process.env.SERVICE_NAME || 'user-service',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'vottery',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // CORS
  CORS: getCORSConfig(),

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Services (for microservice communication)
  services: {
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  },
};
// import * as dotenv from 'dotenv';
// dotenv.config();

// export default {
//   nodeEnv: process.env.NODE_ENV || 'development',
//   port: process.env.PORT || 3002,
//   serviceName: process.env.SERVICE_NAME || 'user-service',
//   database: {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//   },
//   jwt: {
//     secret: process.env.JWT_SECRET,
//     expiresIn: '24h',
//   },
//   services: {
//     authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
//     subscriptionServiceUrl: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3003',
//     roleServiceUrl: process.env.ROLE_SERVICE_URL || 'http://localhost:3004',
//   },
//   logging: {
//     level: process.env.LOG_LEVEL || 'info',
//   },
// };