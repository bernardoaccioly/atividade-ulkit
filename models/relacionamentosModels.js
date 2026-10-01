const sequelize = require('../config/bd');
const Filme = require('./filme.model');
const Diretor = require('./diretor.model');
const Artista = require('./artista.model');
const FichaTecnica = require('./fichaTecnica.model');

Diretor.hasMany(Filme, {
  foreignKey: 'diretorId',
  as: 'filmes'
});

Filme.belongsTo(Diretor, {
  foreignKey: 'diretorId',
  as: 'diretor'
});

Artista.belongsToMany(Filme, {
  through: 'FilmeArtista',
  foreignKey: 'artistaId',
  as: 'filmes'
});

Filme.belongsToMany(Artista, {
  through: 'FilmeArtista',
  foreignKey: 'filmeId',
  as: 'artistas'
});

Filme.hasOne(FichaTecnica, {
  foreignKey: 'filmeId',
  as: 'fichaTecnica'
});

FichaTecnica.belongsTo(Filme, {
  foreignKey: 'filmeId',
  as: 'filme'
});