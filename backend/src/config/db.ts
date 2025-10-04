import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

export const connectMongo = async (uri?: string) => {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/nasa_space_biology';
  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err);
  }
};

export const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/nasa_space_biology', {
  logging: false,
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    // eslint-disable-next-line no-console
    console.log('[db] Connected to PostgreSQL');
  } catch (err) {
    console.error('[db] Postgres connection failed:', err);
  }
};
