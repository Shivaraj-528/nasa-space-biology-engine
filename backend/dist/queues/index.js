"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genelabIngestQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.genelabIngestQueue = new bull_1.default('genelab:ingest', REDIS_URL);
