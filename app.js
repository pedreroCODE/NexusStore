const express = require('express');
const session = require('express-session');
const path = require('path');

require('./src/database/conexao'); 

const app = express();
const PORT = 3000;

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
    if (!req.session.usuario) {
        req.session.usuario = {
            nome: "João",
            isAdmin: false 
            //true para 'adm'
            //false para 'cliente'
        };
    }
    
    res.locals.usuarioLogado = req.session.usuario;
    res.locals.currentPath = req.path;
    next();
});

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

app.get('/pedidos', (req, res) => {
    const samplePedidos = [
        { id_pedido: 1, data_compra: '2026-05-21', valor_total: 299.90, status_pedido: 'Entregue', itens: [
            { nome: 'Fone de Ouvido JBL', quantidade_comprada: 1, preco_congelado: 299.90 }
        ]},
        { id_pedido: 2, data_compra: '2026-06-01', valor_total: 1999.00, status_pedido: 'Em Transporte', itens: [
            { nome: 'Smartphone Galaxy A54', quantidade_comprada: 1, preco_congelado: 1999.00 }
        ]}
    ];
    const id = req.query.id ? parseInt(req.query.id) : null;
    const pedidoSelecionado = samplePedidos.find(p => p.id_pedido === id) || null;
    res.render('pedidos/pedidos', { title: 'Nexus Store - Meus Pedidos', pedidos: samplePedidos, pedidoSelecionado });
});


app.get('/carrinho', (req, res) => {
    const carrinho = [
        { id_produto: 101, nome: 'Mouse Sem Fio Logitech', preco: 129.90, quantidade_comprada: 1, url_foto: '' },
        { id_produto: 102, nome: 'Teclado Sem Fio Logitech', preco: 199.90, quantidade_comprada: 2, url_foto: '' }
    ];
    const totalItens = carrinho.reduce((s, i) => s + i.quantidade_comprada, 0);
    const valorTotalNumber = carrinho.reduce((s, i) => s + i.preco * i.quantidade_comprada, 0);
    const valorTotal = valorTotalNumber.toFixed(2).replace('.', ',');
    res.render('pedidos/carrinho', { title: 'Nexus Store - Carrinho', carrinho, totalItens, valorTotal });
});

app.listen(PORT, () => {
    console.log(`[SERVER] Servidor rodando com sucesso em http://localhost:${PORT}`);
});
