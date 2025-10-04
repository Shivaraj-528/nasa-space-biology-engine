"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSqlModels = exports.AstronautHealth = exports.Experiment = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Experiment extends sequelize_1.Model {
}
exports.Experiment = Experiment;
Experiment.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    organism: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    mission: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    type: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    duration_days: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: db_1.sequelize,
    tableName: 'experiments',
    schema: 'nsbe',
    timestamps: false,
});
class AstronautHealth extends sequelize_1.Model {
}
exports.AstronautHealth = AstronautHealth;
AstronautHealth.init({
    id: { type: sequelize_1.DataTypes.UUID, defaultValue: sequelize_1.DataTypes.UUIDV4, primaryKey: true },
    astronaut_id: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    hr: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    bp: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    created_at: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, {
    sequelize: db_1.sequelize,
    tableName: 'astronaut_health',
    schema: 'nsbe',
    timestamps: false,
});
const syncSqlModels = async () => {
    try {
        // Ensure schema exists and tables are in place; in production prefer migrations
        await db_1.sequelize.query('CREATE SCHEMA IF NOT EXISTS nsbe;');
        await Experiment.sync();
        await AstronautHealth.sync();
        // eslint-disable-next-line no-console
        console.log('[db] Sequelize models synced');
    }
    catch (err) {
        console.error('[db] Sequelize sync skipped due to connection error:', err);
    }
};
exports.syncSqlModels = syncSqlModels;
