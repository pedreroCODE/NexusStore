const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./src/database/conexao');

// importa rotas
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


app.use((req, res, next) => {
    res.locals.usuarioLogado = req.session.usuario || null;
    res.locals.currentPath = req.path;
    res.locals.totalCarrinho = Array.isArray(req.session.carrinho)
        ? req.session.carrinho.reduce((soma, item) => soma + Number(item.quantidade_comprada || 0), 0)
        : 0;
        res.locals.isAdmin = res.locals.usuarioLogado ? Boolean(res.locals.usuarioLogado.isAdmin) : false;
        next();
});


//app.get('/', (req, res) => {
 //   res.render('layouts/index', { title: 'Nexus Store - Home' });
//});


app.get('/', async (req, res) => {
    try {
        //todos os produtos gravados no banco
        const [produtos] = await db.query(
            'SELECT id_produto, nome, preco, url_foto, quantidade_estoque, descricao_produto FROM Produto ORDER BY id_produto DESC'
        );

        // busca produtos para mostrar
        res.render('layouts/index', { 
            title: 'Nexus Store - Home',
            produtos: produtos 
        });
    } catch (erro) {
        console.error('Erro ao carregar os produtos na Home:', erro);
        // nao dar erro caso nao carregar banco
        res.render('layouts/index', { 
            title: 'Nexus Store - Home', 
            produtos: [] 
        });
    }
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



app.post('/produtos/salvar', async (req, res) => {
    // pega dados preenchidos
    const { nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto } = req.body;

    try {
        // sql insert para enviar produto
        const sql = `
            INSERT INTO Produto 
            (nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto];

        // grava no banco
        await db.query(sql, valores);

        console.log(`[SUCESSO] Produto "${nome}" cadastrado com sucesso no banco!`);
        
        // envia para tela principal
        res.redirect('/');
        
    } catch (erro) {
        console.error('Erro ao salvar o produto no banco de dados:', erro);
        res.status(500).send('Erro interno ao salvar o produto. Verifique o console do servidor.');
    }
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

//rotas do carrino e pedidos 
app.use('/', pedidosRoutes);

// processando login
app.post('/auth/login', ClienteController.realizarLogin);

app.post('/auth/cadastro', ClienteController.realizarCadastro);

// saindo da conta
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// inciando servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[SERVER] Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app;