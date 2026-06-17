const bcrypt = require('bcrypt');
const db = require('../database/conexao'); // Conexão com o banco de dados

function isAdminEmail(email) {
    return String(email || '').trim().toLowerCase() === 'admin@nexus.local';
}

const ClienteController = {

    // Cria um novo cliente no banco de dados
    realizarCadastro: async (req, res) => {
        // Pega todos os campos preenchidos no formulário HTML
        const { nome, email, telefone, cep, rua, numero, bairro, cidade, estado, senha } = req.body;

        try {
            // Verifica se o e-mail digitado já existe no sistema
            const [clienteExistente] = await db.query('SELECT * FROM Cliente WHERE email = ?', [email]);
            if (clienteExistente.length > 0) {
                console.log("Erro: Este e-mail já está cadastrado.");
                return res.redirect('/login'); 
            }

            // Criptografa a senha antes de salvar por segurança (padrão 10 rounds)
            const senhaCriptografada = await bcrypt.hash(senha, 10);

            // Comando SQL para inserir os dados na tabela de clientes
            const sql = `INSERT INTO Cliente (nome, email, senha, telefone, cep, rua, numero, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const valores = [nome, email, senhaCriptografada, telefone, cep, rua, numero, bairro, cidade, estado];
            
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
            const [clientes] = await db.query('SELECT * FROM Cliente WHERE email = ?', [email]);
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
                id_cliente: cliente.id_cliente,
                nome: cliente.nome,
                email: cliente.email,
                isAdmin: isAdminEmail(cliente.email)
            };

            res.redirect('/');
        } catch (erro) {
            console.error("Erro ao realizar login:", erro);
            res.redirect('/login');
        }
    },

    // ==========================================
    // ÁREA DO ADMINISTRADOR (GESTÃO DE CLIENTES)
    // ==========================================

    // 1. Listar todos os clientes no painel do administrador
    listarClientes: async (req, res) => {
        try {
            // Busca os dados dos clientes em ordem de cadastro mais recente
            const [clientesDoBanco] = await db.query(
                'SELECT id_cliente, nome, email, telefone, cidade, estado FROM Cliente ORDER BY id_cliente DESC'
            );
            
            res.render('clientes/listar', {
                title: 'Nexus Store - Gestão de Clientes',
                clientes: clientesDoBanco
            });
        } catch (erro) {
            console.error('Erro ao listar clientes no painel admin:', erro);
            res.redirect('/');
        }
    },

    // 2. Carregar a tela de edição de um cliente específico com os dados dele
    exibirEditarCliente: async (req, res) => {
        try {
            const id = req.params.id;
            const [clienteDoBanco] = await db.query('SELECT * FROM Cliente WHERE id_cliente = ?', [id]);
            
            // Se o cliente não existir, joga de volta para a listagem
            if (clienteDoBanco.length === 0) return res.redirect('/admin/clientes');

            res.render('clientes/editar', {
                title: 'Nexus Store - Editar Cliente',
                cliente: clienteDoBanco[0]
            });
        } catch (erro) {
            console.error('Erro ao abrir formulário de edição de cliente:', erro);
            res.redirect('/admin/clientes');
        }
    },

    // 3. Salvar as alterações cadastrais feitas pelo administrador
    salvarEdicaoCliente: async (req, res) => {
        const { id_cliente, nome, email, telefone, cpf, cep, rua, numero, bairro, cidade, estado } = req.body;
        
        try {
            const sql = `
                UPDATE Cliente SET 
                nome = ?, email = ?, telefone = ?, cpf = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, estado = ?
                WHERE id_cliente = ?
            `;
            const valores = [nome, email, telefone, cpf, cep, rua, numero, bairro, cidade, estado, id_cliente];
            
            await db.query(sql, valores);
            console.log(`[SUCESSO] Cadastro do cliente ID #${id_cliente} atualizado pelo Administrador.`);
            
            res.redirect('/admin/clientes');
        } catch (erro) {
            console.error('Erro ao salvar as modificações do cliente:', erro);
            res.redirect('/admin/clientes');
        }
    },

    // 4. Excluir um cliente pelo painel administrativo
    excluirCliente: async (req, res) => {
        try {
            const id = req.params.id;
            
            // Busca o e-mail para impedir que o Administrador delete a si mesmo por acidente
            const [cliente] = await db.query('SELECT email FROM Cliente WHERE id_cliente = ?', [id]);
            
            if (cliente.length > 0 && isAdminEmail(cliente[0].email)) {
                return res.send("<script>alert('Operação negada! Você não pode excluir a conta master do administrador.'); window.location.href='/admin/clientes';</script>");
            }

            // Deleta o usuário do banco
            await db.query('DELETE FROM Cliente WHERE id_cliente = ?', [id]);
            console.log(`[SUCESSO] Cliente ID #${id} foi removido do sistema.`);
            
            res.redirect('/admin/clientes');
        } catch (erro) {
            console.error('Erro ao excluir cliente:', erro);
            // Alerta caso o cliente tenha chaves estrangeiras travando no banco (como pedidos feitos)
            res.send("<script>alert('Não foi possível excluir o cliente. Verifique se ele possui pedidos ativos vinculados no histórico.'); window.location.href='/admin/clientes';</script>");
        }
    }
};

module.exports = ClienteController;