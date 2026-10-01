const express = require('express');
const path = require('path');

const exphbs = require('express-handlebars');
const sequelize = require('./config/bd');
const Filme = require('./models/filme.model');
const Diretor = require('./models/diretor.model');
const Artista = require('./models/artista.model');
const FichaTecnica = require('./models/fichaTecnica.model');
const methodOverride = require('method-override');

require('./models/relacionamentosModels');

const app = express();

app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
// Middleware para formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurando Handlebars
app.engine('handlebars', exphbs.engine({
  defaultLayout: "main",
  helpers: {
      eq: function (v1, v2) {
        return v1 == v2; 
      }
  }
}));

app.set('view engine', 'handlebars');

// Rota GET - Página inicial
app.get('/', (req, res) => {

  res.render('home', {
    titulo: 'Página Inicial'
  });

});

// ===================== FILMES =====================

// Rota GET - Listar filmes
app.get('/filmes', async (req, res) => {
  const filmes = await Filme.findAll({raw: true});
  res.render('filmes/filmes', { filmes });
});

// Rota GET - Formulário de cadastro
app.get(
  '/filmes/cadastrar', 
  async (req, res) => {
    const diretores = await Diretor.findAll({raw: true});
    const artistas = await Artista.findAll({raw: true});
    res.render('filmes/cadastrarFilme', { diretores, artistas });
  }
);

// Rota POST - Cadastrar filme
app.post('/filmes', async (req, res) => {

  const nome = req.body.nome;
  const ano = req.body.ano;
  const diretorId = req.body.diretorId;
  const artistas = req.body.artistas; 

  const filme = await Filme.create({
    nome: nome, 
    ano: ano,
    diretorId: diretorId,
  });

  if (artistas && artistas.length > 0) 
    await filme.setArtistas(artistas);

  res.redirect('/filmes');
});

app.get(
  '/filmes/:id/editar', 
  async (req, res) => {
    const id = req.params.id;
    const filme = await Filme.findByPk(id, {
      include: [{ model: Artista, as: 'artistas' }]
    });
    const diretores = await Diretor.findAll({raw: true});

    // Marca quais artistas já estão associados ao filme
    const idsSelecionados = filme.artistas.map(a => a.id);
    const artistas = (await Artista.findAll({raw: true})).map(a => ({
      ...a,
      selecionado: idsSelecionados.includes(a.id)
    }));

    res.render('filmes/editarFilme', { filme: filme.toJSON(), diretores, artistas });
  }
);

app.put(
  '/filmes/:id', 
  async (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const ano = req.body.ano;
    const diretorId = req.body.diretorId;
    const artistas = req.body.artistas;
    
    const filme = await Filme.findByPk(id);
    
    filme.nome = nome;
    filme.ano = ano;
    filme.diretorId = diretorId;
    await filme.save();

    if (artistas && artistas.length > 0)
      await filme.setArtistas(artistas);

    res.redirect('/filmes');
  }
);

app.delete(
  '/filmes/:id', 
  async (req, res) => {
    const id = req.params.id;
    const filme = await Filme.findByPk(id);
    await filme.destroy();
    res.redirect('/filmes');
  }
);

app.get('/filmes/:id/ficha-tecnica/cadastrar', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, { raw: true });

  res.render('filmes/cadastrarFichaTecnica', { filme });
});

app.post('/filmes/:id/ficha-tecnica', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id);

  await filme.createFichaTecnica({
    duracaoMinutos: req.body.duracaoMinutos,
    orcamento: req.body.orcamento,
    bilheteria: req.body.bilheteria
  });

  res.redirect(`/filmes/${id}`);
});

app.get('/filmes/:id', async (req, res) => {
  const id = req.params.id;

  const filme = await Filme.findByPk(id, {
    include: [
      { model: Diretor, as: 'diretor' },
      { model: Artista, as: 'artistas' },
      { model: FichaTecnica, as: 'fichaTecnica' }
    ]
  });

  console.log('ESTOU NA ROTA DE DETALHE DO FILME');
  console.log(filme.toJSON());

  res.render('filmes/detalharFilme', {
    filme: filme.toJSON()
  });
});

// ===================== DIRETORES =====================

// Rota GET - Listar diretores
app.get('/diretores', async (req, res) => {
  const diretores = await Diretor.findAll({raw: true});
  res.render('diretores/diretores', { diretores });
});

// Rota GET - Formulário de cadastro
app.get(
  '/diretores/cadastrar', 
  (req, res) => res.render('diretores/cadastrarDiretor')
);

// Rota POST - Cadastrar diretor
app.post('/diretores', async (req, res) => {

  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nacionalidade = req.body.nacionalidade;

  await Diretor.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nacionalidade: nacionalidade
  });

  res.redirect('/diretores');
});

app.get(
  '/diretores/:id/editar', 
  async (req, res) => {
    const id = req.params.id;
    const diretor = await Diretor.findByPk(id, {raw: true});
    res.render('diretores/editarDiretor', { diretor });
  }
);

app.put(
  '/diretores/:id', 
  async (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const anoNascimento = req.body.anoNascimento;
    const nacionalidade = req.body.nacionalidade;
    
    const diretor = await Diretor.findByPk(id);
    
    diretor.nome = nome;
    diretor.anoNascimento = anoNascimento;
    diretor.nacionalidade = nacionalidade;
    await diretor.save();

    res.redirect('/diretores');
  }
);

app.delete(
  '/diretores/:id', 
  async (req, res) => {
    const id = req.params.id;
    const diretor = await Diretor.findByPk(id);
    await diretor.destroy();
    res.redirect('/diretores');
  }
);

app.get('/diretores/:id', async (req, res) => {
  const id = req.params.id;
  const diretor = await Diretor.findByPk(id, { include: [{ model: Filme, as: 'filmes' }] });
  res.render('diretores/detalharDiretor', { diretor: diretor.toJSON() });
});

// ===================== ARTISTAS =====================

// Rota GET - Listar artistas
app.get('/artistas', async (req, res) => {
  const artistas = await Artista.findAll({raw: true});
  res.render('artistas/artistas', { artistas });
});

// Rota GET - Formulário de cadastro
app.get(
  '/artistas/cadastrar', 
  async (req, res) => {
    const filmes = await Filme.findAll({raw:true});
    res.render('artistas/cadastrarArtista', { filmes });
  }
);

// Rota POST - Cadastrar artista
app.post('/artistas', async (req, res) => {

  const nome = req.body.nome;
  const anoNascimento = req.body.anoNascimento;
  const nomeArtistico = req.body.nomeArtistico;
  const emAtividade = req.body.emAtividade;
  const foto = req.body.foto;
  const filmes = req.body.filmes;

  const artista = await Artista.create({
    nome: nome,
    anoNascimento: anoNascimento,
    nomeArtistico: nomeArtistico,
    emAtividade: emAtividade,
    foto: foto
  });

  if (filmes && filmes.length > 0)
    await artista.setFilmes(filmes);

  res.redirect('/artistas');
});

app.get(
  '/artistas/:id/editar', 
  async (req, res) => {
    const id = req.params.id;
    const artista = await Artista.findByPk(id, {
      include: [{ model: Filme, as: 'filmes' }]
    });

    // Marca quais filmes já estão associados ao artista
    const idsSelecionados = artista.filmes.map(f => f.id);
    const filmes = (await Filme.findAll({raw:true})).map(f => ({
      ...f,
      selecionado: idsSelecionados.includes(f.id)
    }));

    res.render('artistas/editarArtista', { artista: artista.toJSON(), filmes });
  }
);

app.put(
  '/artistas/:id', 
  async (req, res) => {
    const id = req.params.id;
    const nome = req.body.nome;
    const anoNascimento = req.body.anoNascimento;
    const nomeArtistico = req.body.nomeArtistico;
    const emAtividade = req.body.emAtividade;
    const foto = req.body.foto;
    const filmes = req.body.filmes;

    const artista = await Artista.findByPk(id);

    artista.nome = nome;
    artista.anoNascimento = anoNascimento;
    artista.nomeArtistico = nomeArtistico;
    artista.emAtividade = emAtividade;
    artista.foto = foto;
    await artista.save();

    if (filmes && filmes.length > 0)
      await artista.setFilmes(filmes);

    res.redirect('/artistas');
  }
);

app.delete(
  '/artistas/:id', 
  async (req, res) => {
    const id = req.params.id;
    const artista = await Artista.findByPk(id);
    await artista.destroy();
    res.redirect('/artistas');
  }
);

app.get('/artistas/:id', async (req, res) => {
  const id = req.params.id;
  const artista = await Artista.findByPk(id, { include: [{ model: Filme, as: 'filmes' }] });
  res.render('artistas/detalharArtista', { artista: artista.toJSON() });
});

// ===================== BANCO / SERVIDOR =====================

async function conectarBD() {
  try {
    await sequelize.sync();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  } catch (erro) {
    console.error('Erro ao conectar:', erro);
  }
}

conectarBD();

// Inicializando servidor
app.listen(3000, () => {

  console.log('Servidor executando em http://localhost:3000');

});