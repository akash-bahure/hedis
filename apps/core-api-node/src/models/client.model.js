const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Client = sequelize.define(
  "Client",
  {
    // PRIMARY KEY
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // -------------------------
    // STEP 1: ORGANIZATION
    // -------------------------
    org_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
    },
    short_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    region: {
      type: DataTypes.ENUM("North", "South", "East", "West"),
      allowNull: false,
    },
    plan_tier: {
      type: DataTypes.ENUM("Basic", "Professional", "Enterprise"),
      defaultValue: "Professional",
    },
    status: {
      type: DataTypes.ENUM("Onboarding", "Active", "Inactive"),
      defaultValue: "Onboarding",
    },

    // -------------------------
    // STEP 2: CONTRACT (Single)
    // -------------------------
    contract_type: {
      type: DataTypes.ENUM(
        "HEDIS Hybrid",
        "HEDIS Administrative",
        "HEDIS Electronic",
        "Multi-Measure"
      ),
      allowNull: false,
    },
    measure_year: {
      type: DataTypes.ENUM("MY2024", "MY2025", "MY2026", "MY2027"),
      allowNull: false,
    },
    total_charts: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // -------------------------
    // STEP 3: CONTACT (Single)
    // -------------------------
    primary_contact_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    abstractors_assigned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Client;