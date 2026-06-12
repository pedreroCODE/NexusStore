const bcrypt = require('bcrypt');
const db = require('../database/conexao'); // Conexão com o banco de dados

const ClienteController = {

    // Cria um novo cliente no banco de dados
    realizarCadastro: async (req, res) => {
        // Pega todos os campos preenchidos no formulário HTML
        const { nome, email, cpf, telefone, cep, rua, numero, bairro, cidade, estado, senha } = req.body;

        try {
            // Verifica se o e-mail digitado já existe no sistema
            const [clienteExistente] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
            if (clienteExistente.length > 0) {
                console.log("Erro: Este e-mail já está cadastrado.");
                return res.redirect('/login'); 
            }

            // Criptografa a senha antes de salvar por segurança (padrão 10 rounds)
            const senhaCriptografada = await bcrypt.hash(senha, 10);

            // Comando SQL para inserir os dados na tabela de clientes
            const sql = `INSERT INTO clientes (nome, email, cpf, telefone, cep, rua, numero, bairro, cidade, estado, senha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const valores = [nome, email, cpf, telefone, cep, rua, numero, bairro, cidade, estado, senhaCriptografada];
            
            // Executa a gravação no banco de dados
            await db.query(sql, valores);

            console.log("Cadastro realizado com sucesso! Redirecionando para o login.");
            // Volta para a tela de login para o usuário entrar com a nova conta
            res.redirect('/login');
            
        } catch (erro) {
            console.error("Erro ao realizar cadastro:", erro);
            res.redirect('/login');
        }
    },

    // Valida o acesso do cliente no login
    realizarLogin: async (req, res) => {
        const { email, senha } = req.body;

        try {
            // Busca o usuário pelo e-mail
            const [clientes] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
            if (clientes.length === 0) {
                console.log("Erro: Usuário não encontrado.");
                return res.redirect('/login');
            }

            const cliente = clientes[0];

            // Compara a senha digitada com a senha criptografada do banco
            const senhaValida = await bcrypt.compare(senha, cliente.senha);
            if (!senhaValida) {
                console.log("Erro: Senha incorreta.");
                return res.redirect('/login');
            }

            // Se tudo estiver certo, cria a sessão do usuário conectado
            req.session.usuario = {
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email,
                isAdmin: false
            };

            res.redirect('/');
        } catch (erro) {
            console.error("Erro ao realizar login:", erro);
            res.redirect('/login');
        }
    }
};

module.exports = ClienteController;