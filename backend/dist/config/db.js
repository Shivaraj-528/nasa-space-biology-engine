"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectPostgres = exports.sequelize = exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const sequelize_1 = require("sequelize");
const connectMongo = async (uri) => {
    const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/nasa_space_biology';
    try {
        await mongoose_1.default.connect(mongoUri);
        // eslint-disable-next-line no-console
        console.log(`[db] Connected to MongoDB at ${mongoUri}`);
    }
    catch (err) {
        console.error('[db] MongoDB connection failed:', err);
    }
};
exports.connectMongo = connectMongo;
exports.sequelize = new sequelize_1.Sequelize(process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/nasa_space_biology', {
    logging: false,
});
const connectPostgres = async () => {
    try {
        await exports.sequelize.authenticate();
        // eslint-disable-next-line no-console
        console.log('[db] Connected to PostgreSQL');
    }
    catch (err) {
        console.error('[db] Postgres connection failed:', err);
    }
};
exports.connectPostgres = connectPostgres;
