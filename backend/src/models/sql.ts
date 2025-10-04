import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// Experiment model (PostgreSQL)
export interface ExperimentAttributes {
  id: string;
  organism: string;
  mission: string;
  type: string;
  duration_days?: number | null;
  created_at?: Date;
}

export type ExperimentCreationAttributes = Optional<ExperimentAttributes, 'id' | 'created_at'>;

export class Experiment extends Model<ExperimentAttributes, ExperimentCreationAttributes>
  implements ExperimentAttributes {
  public id!: string;
  public organism!: string;
  public mission!: string;
  public type!: string;
  public duration_days!: number | null;
  public created_at!: Date;
}

Experiment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organism: { type: DataTypes.STRING, allowNull: false },
    mission: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    duration_days: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'experiments',
    schema: 'nsbe',
    timestamps: false,
  }
);

// AstronautHealth model (PostgreSQL)
export interface AstronautHealthAttributes {
  id: string;
  astronaut_id: string;
  hr?: number | null;
  bp?: string | null;
  created_at?: Date;
}
export type AstronautHealthCreationAttributes = Optional<AstronautHealthAttributes, 'id' | 'hr' | 'bp' | 'created_at'>;

export class AstronautHealth extends Model<AstronautHealthAttributes, AstronautHealthCreationAttributes>
  implements AstronautHealthAttributes {
  public id!: string;
  public astronaut_id!: string;
  public hr!: number | null;
  public bp!: string | null;
  public created_at!: Date;
}

AstronautHealth.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    astronaut_id: { type: DataTypes.STRING, allowNull: false },
    hr: { type: DataTypes.INTEGER, allowNull: true },
    bp: { type: DataTypes.STRING, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    tableName: 'astronaut_health',
    schema: 'nsbe',
    timestamps: false,
  }
);

export const syncSqlModels = async () => {
  try {
    // Ensure schema exists and tables are in place; in production prefer migrations
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS nsbe;');
    await Experiment.sync();
    await AstronautHealth.sync();
    // eslint-disable-next-line no-console
    console.log('[db] Sequelize models synced');
  } catch (err) {
    console.error('[db] Sequelize sync skipped due to connection error:', err);
  }
};
