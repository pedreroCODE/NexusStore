const express = require('express');
const session = require('express-session');
const path = require('path');


require('./src/database/conexao'); 

const app = express();
const PORT = process.env.PORT || 3000;


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


app.get('/', (req, res) => {
    res.render('layouts/index', { title: 'Nexus Store - Home' });
});


app.listen(PORT, () => {
    console.log(`[SERVER] Servidor rodando com sucesso em http://localhost:${PORT}`);
});

app.get('/login', (req, res) => {
    res.render('layouts/login', { title: 'Nexus Store - Autenticação' });
});
