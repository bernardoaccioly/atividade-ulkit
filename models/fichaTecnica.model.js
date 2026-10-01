const { DataTypes } = require('sequelize');

const sequelize = require('../config/bd');

const FichaTecnica = sequelize.define(
  'FichaTecnica',
  {
    duracaoMinutos: {
      type: DataTypes.INTEGER
    },

    orcamento: {
      type: DataTypes.FLOAT
    },

    bilheteria: {
      type: DataTypes.FLOAT
    },

    filmeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },

  {
    tableName: 'FichasTecnicas',
    timestamps: true
  }
);

module.exports = FichaTecnica;