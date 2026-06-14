const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./src/database/conexao');

// Importa as tuas rotas de Pedidos e Carrinho separadas (Padrão MVC)
const pedidosRoutes = require('./src/routes/pedidosRoutes');
const ClienteController = require('./src/controllers/ClienteController');

require('./src/database/conexao'); 

const app = express();
const PORT = 3001; 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'nexus_store_secret_token_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Middleware de sessão e variáveis globais de view
app.use((req, res, next) => {
    res.locals.usuarioLogado = req.session.usuario || null;
    res.locals.currentPath = req.path;
    res.locals.totalCarrinho = Array.isArray(req.session.carrinho)
        ? req.session.carrinho.reduce((soma, item) => soma + Number(item.quantidade_comprada || 0), 0)
        : 0;
        res.locals.isAdmin = res.locals.usuarioLogado ? Boolean(res.locals.usuarioLogado.isAdmin) : false;
        next();
});

// ROTAS DE EXIBIÇÃO DE TELAS (GET)
app.get('/', (req, res) => {
    res.render('layouts/index', { title: 'Nexus Store - Home' });
});

app.get('/login', (req, res) => {
    res.render('layouts/login', { title: 'Nexus Store - Autenticação' });
});

app.get('/produtos', (req, res) => {
    res.render('produtos/listar', { title: 'Nexus Store - Painel de Produtos' });
});

app.get('/produtos/novo', (req, res) => {
    res.render('produtos/cadastro', { title: 'Nexus Store - Novo Produto' });
});

app.get('/minha-conta', (req, res) => {
    res.render('minhaconta', { title: 'Nexus Store - Minha Conta' });
});

app.get('/categorias', async (req, res) => {
    try {
        const [categorias] = await db.query(
            'SELECT id_categoria, nome, descricao_categoria, status FROM Categoria ORDER BY nome ASC'
        );

        res.render('categorias/listar', {
            title: 'Nexus Store - Categorias',
            categorias
        });
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
        res.status(500).send('Nao foi possivel carregar as categorias.');
    }
});

app.get('/admin/pedidos', (req, res) => {
    res.redirect('/pedidos');
});

app.get('/admin/clientes', (req, res) => {
    res.redirect('/minha-conta');
});

// ===============================================
// INJEÇÃO DAS TUAS ROTAS DO CARRINHO E PEDIDOS
// ===============================================
app.use('/', pedidosRoutes);

// ROTAS DE PROCESSAMENTO (POST)
app.post('/auth/login', ClienteController.realizarLogin);

app.post('/auth/cadastro', ClienteController.realizarCadastro);

// Rota de Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// INICIALIZAÇÃO
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[SERVER] Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app;