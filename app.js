const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./src/database/conexao');

// Importa rotas e controllers
const pedidosRoutes = require('./src/routes/pedidosRoutes');
const ClienteController = require('./src/controllers/ClienteController');
const CategoriaController = require('./src/controllers/CategoriaController');

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

// Middleware Global para disponibilizar variáveis nas telas (EJS)
app.use((req, res, next) => {
    res.locals.usuarioLogado = req.session.usuario || null;
    res.locals.currentPath = req.path;
    res.locals.totalCarrinho = Array.isArray(req.session.carrinho)
        ? req.session.carrinho.reduce((soma, item) => soma + Number(item.quantidade_comprada || 0), 0)
        : 0;
    res.locals.isAdmin = res.locals.usuarioLogado ? Boolean(res.locals.usuarioLogado.isAdmin) : false;
    next();
});

// ==========================================
// ROTA PRINCIPAL (HOME)
// ==========================================
app.get('/', async (req, res) => {
    try {
        const categoriaFiltro = req.query.categoria; 
        
        // CORRIGIDO: Removido o erro de digitação da coluna do banco
        let queryProdutos = 'SELECT id_produto, nome, preco, url_foto, quantidade_estoque, descricao_produto FROM Produto WHERE quantidade_estoque > 0';
        let paramsProdutos = [];

        if (categoriaFiltro) {
            queryProdutos += ' AND id_categoria = ?';
            paramsProdutos.push(categoriaFiltro);
        }
        
        queryProdutos += ' ORDER BY id_produto DESC';

        const [produtos] = await db.query(queryProdutos, paramsProdutos);
        const [categorias] = await db.query('SELECT id_categoria, nome FROM Categoria WHERE status = 1 ORDER BY nome ASC');

        res.render('layouts/index', { 
            title: 'Nexus Store - Home',
            produtos: produtos,
            categorias: categorias, // CORRIGIDO: Removido o bug visual
            categoriaAtual: categoriaFiltro || null 
        });
    } catch (erro) {
        console.error('Erro ao carregar os produtos na Home:', erro);
        res.render('layouts/index', { 
            title: 'Nexus Store - Home', 
            produtos: [],
            categorias: [],
            categoriaAtual: null
        });
    }
});

// ==========================================
// ROTAS DE PRODUTOS (CRUD COMPLETO)
// ==========================================
app.get('/produtos', async (req, res) => {
    try {
        const query = `
            SELECT p.id_produto, p.nome, p.preco, p.quantidade_estoque, c.nome AS categoria_nome 
            FROM Produto p 
            LEFT JOIN Categoria c ON p.id_categoria = c.id_categoria 
            ORDER BY p.id_produto DESC
        `;
        const [produtosDoBanco] = await db.query(query);
        res.render('produtos/listar', { title: 'Nexus Store - Painel de Produtos', produtos: produtosDoBanco });
    } catch (erro) {
        console.error('Erro ao listar produtos no painel:', erro);
        res.render('produtos/listar', { title: 'Nexus Store - Painel de Produtos', produtos: [] });
    }
});

app.get('/produtos/novo', async (req, res) => {
    try {
        const [categoriasDoBanco] = await db.query('SELECT id_categoria, nome FROM Categoria WHERE status = 1');
        // CORRIGIDO: Removido bug visual "Pattern ="
        res.render('produtos/cadastro', { title: 'Nexus Store - Novo Produto', categorias: categoriasDoBanco, produto: null });
    } catch (erro) {
        console.error('Erro na rota /produtos/novo:', erro);
        res.redirect('/produtos');
    }
});

app.get('/produtos/editar/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const [produtoDoBanco] = await db.query('SELECT * FROM Produto WHERE id_produto = ?', [id]);
        const [categoriasDoBanco] = await db.query('SELECT id_categoria, nome FROM Categoria WHERE status = 1');
        if (produtoDoBanco.length === 0) return res.redirect('/produtos');
        res.render('produtos/cadastro', { title: 'Nexus Store - Editar Produto', categorias: categoriasDoBanco, produto: produtoDoBanco[0] });
    } catch (erro) {
        console.error('Erro na rota /produtos/editar:', erro);
        res.redirect('/produtos');
    }
});

app.post('/produtos/salvar', async (req, res) => {
    const { id_produto, nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto } = req.body;
    try {
        if (id_produto) {
            const sql = `UPDATE Produto SET nome=?, descricao_produto=?, id_categoria=?, preco=?, quantidade_estoque=?, url_foto=? WHERE id_produto=?`;
            // CORRIGIDO: Removido o "pattern =" de dentro do array
            await db.query(sql, [nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto, id_produto]);
        } else {
            const sql = `INSERT INTO Produto (nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto) VALUES (?, ?, ?, ?, ?, ?)`;
            await db.query(sql, [nome, descricao_produto, id_categoria, preco, quantidade_estoque, url_foto]);
        }
        res.redirect('/produtos');
    } catch (erro) {
        console.error('Erro ao salvar o produto no banco:', erro);
        res.redirect('/produtos');
    }
});

app.post('/produtos/excluir/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await db.query('DELETE FROM Produto WHERE id_produto = ?', [id]);
        res.redirect('/produtos');
    } catch (erro) {
        console.error('Erro ao excluir produto:', erro.message);
        
        // Verifica se o erro foi causado pela trava de segurança do banco (Foreign Key)
        if (erro.errno === 1451) {
            return res.send("<script>alert('AÇÃO BLOQUEADA: Você não pode excluir este produto porque ele já faz parte do histórico de pedidos de algum cliente. Tente zerar o estoque dele em vez de excluí-lo.'); window.location.href='/produtos';</script>");
        }
        
        // Se for outro erro qualquer
        res.send("<script>alert('Ocorreu um erro ao tentar excluir o produto.'); window.location.href='/produtos';</script>");
    }
});

// ==========================================
// ROTAS DE CATEGORIAS (CRUD COMPLETO)
// ==========================================
app.get('/categorias', async (req, res) => {
    try {
        const [categorias] = await db.query('SELECT id_categoria, nome, descricao_categoria, status FROM Categoria ORDER BY nome ASC');
        res.render('categorias/listar', { title: 'Nexus Store - Categorias', categorias });
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
        res.status(500).send('Nao foi possivel carregar as categorias.');
    }
});

app.get('/categorias/nova', CategoriaController.exibirCadastro);
app.post('/categorias/salvar', CategoriaController.salvarCategoria);
app.post('/categorias/excluir/:id', CategoriaController.excluirCategoria);

// ==========================================
// ROTAS DE GESTÃO DE CLIENTES (ADMINISTRADOR)
// ==========================================
app.get('/admin/clientes', ClienteController.listarClientes);
app.get('/admin/clientes/editar/:id', ClienteController.exibirEditarCliente);
app.post('/admin/clientes/salvar', ClienteController.salvarEdicaoCliente);
app.post('/admin/clientes/excluir/:id', ClienteController.excluirCliente);

// ==========================================
// ROTAS GERAIS E AUTENTICAÇÃO
// ==========================================
app.get('/login', (req, res) => res.render('layouts/login', { title: 'Nexus Store - Autenticação' }));
app.get('/minha-conta', (req, res) => res.render('minhaconta', { title: 'Nexus Store - Minha Conta' }));
app.get('/admin/pedidos', (req, res) => res.redirect('/pedidos'));

app.use('/', pedidosRoutes);

app.post('/auth/login', ClienteController.realizarLogin);
app.post('/auth/cadastro', ClienteController.realizarCadastro);

app.get('/logout', (req, res) => {
    req.session.destroy(() => { res.redirect('/login'); });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[SERVER] Servidor rodando com sucesso em http://localhost:${PORT}`);
    });
}

module.exports = app;