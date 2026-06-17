const db = require('../database/conexao');

const CategoriaController = {
    // Exibe a tela de cadastro (vazia para criar nova ou preenchida para editar)
    exibirCadastro: async (req, res) => {
        const { id } = req.query; // Pega o ID da URL se estiver editando (ex: /categorias/nova?id=1)
        
        try {
            let categoria = null;
            if (id) {
                // Se tem ID, busca os dados no banco para preencher a tela
                const [resultado] = await db.query('SELECT * FROM Categoria WHERE id_categoria = ?', [id]);
                if (resultado.length > 0) categoria = resultado[0];
            }
            res.render('categorias/cadastro', { title: 'Nexus Store - Categoria', categoria });
        } catch (erro) {
            console.error("Erro ao carregar categoria:", erro);
            res.redirect('/categorias');
        }
    },

    // Salva a categoria (Serve para INSERT ou UPDATE)
    salvarCategoria: async (req, res) => {
        const { id_categoria, nome, descricao_categoria, status } = req.body;
        const statusBool = status === '1'; // Converte para booleano (1 ou 0)

        try {
            if (id_categoria) {
                // Se enviou ID, é uma EDIÇÃO (UPDATE)
                await db.query(
                    'UPDATE Categoria SET nome = ?, descricao_categoria = ?, status = ? WHERE id_categoria = ?',
                    [nome, descricao_categoria, statusBool, id_categoria]
                );
            } else {
                // Se não enviou ID, é uma CRIAÇÃO (INSERT)
                await db.query(
                    'INSERT INTO Categoria (nome, descricao_categoria, status) VALUES (?, ?, ?)',
                    [nome, descricao_categoria, statusBool]
                );
            }
            res.redirect('/categorias'); // Volta para a tela principal de categorias
        } catch (erro) {
            console.error("Erro ao salvar categoria:", erro);
            res.redirect('/categorias/nova');
        }
    },

    // Exclui a categoria do banco
    excluirCategoria: async (req, res) => {
        const { id } = req.params;

        try {
            await db.query('DELETE FROM Categoria WHERE id_categoria = ?', [id]);
            res.redirect('/categorias');
        } catch (erro) {
            console.error("Erro ao excluir categoria (Pode ter produtos nela):", erro);
            res.redirect('/categorias'); // Idealmente, passar um erro pela URL
        }
    }
};

module.exports = CategoriaController;