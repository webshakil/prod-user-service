import app from './src/app.js';
import logger from './src/utils/logger.js';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  logger.info(`User Service running on port ${PORT}`);
  console.log(`✅ User Service running on port ${PORT}`);
});