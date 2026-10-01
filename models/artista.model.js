const { DataTypes } = require('sequelize');
const sequelize = require('../config/bd');

const Artista = sequelize.define(
  'Artista', 
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false
    },
    anoNascimento: {
      type: DataTypes.INTEGER,
    },
    emAtividade: {
      type: DataTypes.BOOLEAN,
    },
    foto: {
      type: DataTypes.STRING,
    },
    nomeArtistico: {
      type: DataTypes.STRING,
    }
  },
  {
    tableName: 'Artistas',
    timestamps: true
  }
);

module.exports = Artista;