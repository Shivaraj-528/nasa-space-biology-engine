"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const data_1 = __importDefault(require("./routes/data"));
const ai_1 = __importDefault(require("./routes/ai"));
const health_1 = __importDefault(require("./routes/health"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const datasetDetail_1 = __importDefault(require("./routes/datasetDetail"));
const publications_1 = __importDefault(require("./routes/publications"));
const db_1 = require("./config/db");
const sql_1 = require("./models/sql");
const processor_1 = require("./queues/processor");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// API routes
app.use('/api/v1', auth_1.default);
app.use('/api/v1', data_1.default);
app.use('/api/v1', ai_1.default);
app.use('/api/v1', health_1.default);
app.use('/api/v1', admin_1.default);
app.use('/api/v1', chatbot_1.default);
app.use('/api/v1', datasetDetail_1.default);
app.use('/api/v1', publications_1.default);
// Swagger docs
const swaggerPath = path_1.default.join(__dirname, '../swagger.yaml');
const swaggerDocument = yamljs_1.default.load(swaggerPath);
app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
});
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
async function start() {
    await Promise.all([(0, db_1.connectMongo)(), (0, db_1.connectPostgres)()]);
    await (0, sql_1.syncSqlModels)();
    // Only register queue processors if not in production or if ENABLE_QUEUE_PROCESSING is true
    // In production, use a separate worker process via `npm run worker`
    const enableQueueProcessing = process.env.ENABLE_QUEUE_PROCESSING === 'true' || process.env.NODE_ENV !== 'production';
    if (enableQueueProcessing) {
        // eslint-disable-next-line no-console
        console.log('[server] Registering queue processors in main process');
        (0, processor_1.registerGenelabProcessor)();
    }
    else {
        // eslint-disable-next-line no-console
        console.log('[server] Queue processing disabled. Use `npm run worker` to start a dedicated worker.');
    }
    app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Backend API listening on http://localhost:${PORT}`);
    });
}
start();
