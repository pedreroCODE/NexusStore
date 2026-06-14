const db = require('../database/conexao');

function normalizarCarrinho(req) {
    if (!Array.isArray(req.session.carrinho)) {
        req.session.carrinho = [];
    }

    return req.session.carrinho;
}

function calcularResumo(carrinho) {
    const totalItens = carrinho.reduce((soma, item) => soma + Number(item.quantidade_comprada || 0), 0);
    const valorTotal = carrinho.reduce((soma, item) => soma + Number(item.preco || 0) * Number(item.quantidade_comprada || 0), 0);

    return {
        totalItens,
        valorTotal: Number(valorTotal.toFixed(2))
    };
}

async function obterClienteId(connection, req) {
    const sessao = req.session.usuario || {};
    const idSessao = Number(sessao.id_cliente || 0);

    if (idSessao > 0) {
        return idSessao;
    }

    return null;
}

function obterSessaoUsuario(req) {
    return req.session.usuario || {};
}

function exigirAdmin(req) {
    const usuarioLogado = obterSessaoUsuario(req);
    return Boolean(usuarioLogado.isAdmin);
}

function statusPedidoValido(status) {
    const statusNormalizado = String(status || '').trim();
    return ['Recebido', 'Em Transporte', 'Entregue', 'Cancelado'].includes(statusNormalizado)
        ? statusNormalizado
        : null;
}

function agruparPedidos(linhas) {
    const pedidosMap = new Map();

    linhas.forEach((linha) => {
        const pedidoId = Number(linha.id_pedido);

        if (!pedidosMap.has(pedidoId)) {
            pedidosMap.set(pedidoId, {
                id_pedido: pedidoId,
                data_compra: linha.data_compra,
                valor_total: Number(linha.valor_total),
                status_pedido: linha.status_pedido,
                nome_cliente: linha.nome_cliente || '',
                email_cliente: linha.email_cliente || '',
                metodo_pagamento: linha.metodo_pagamento || null,
                itens: []
            });
        }

        if (linha.id_item) {
            pedidosMap.get(pedidoId).itens.push({
                nome: linha.nome_produto,
                quantidade_comprada: Number(linha.quantidade_comprada),
                preco_congelado: Number(linha.preco_congelado)
            });
        }
    });

    return Array.from(pedidosMap.values());
}

function agruparItensCarrinho(carrinho) {
    const itensMap = new Map();

    carrinho.forEach((item) => {
        const idProduto = Number(item.id_produto);
        const quantidade = Math.max(1, Number(item.quantidade_comprada || 1));

        if (!itensMap.has(idProduto)) {
            itensMap.set(idProduto, {
                id_produto: idProduto,
                nome: String(item.nome || '').trim(),
                preco: Number(item.preco || 0),
                quantidade_comprada: 0,
                url_foto: String(item.url_foto || '').trim()
            });
        }

        itensMap.get(idProduto).quantidade_comprada += quantidade;
    });

    return Array.from(itensMap.values()).filter((item) => item.id_produto > 0);
}

const PedidosController = {
    exibirPedidos: async (req, res) => {
        try {
            const connection = await db.getConnection();

            try {
                const usuarioLogado = obterSessaoUsuario(req);
                const isAdmin = Boolean(usuarioLogado.isAdmin);
                const clienteId = await obterClienteId(connection, req);
                const pedidoSucesso = req.session.pedidoSucesso || '';
                const buscaPedidos = String(req.query.q || '').trim();
                req.session.pedidoSucesso = '';

                if (!clienteId && !isAdmin) {
                    return res.render('pedidos/pedidos', {
                        title: 'Nexus Store - Meus Pedidos',
                        pedidos: [],
                        pedidoSelecionado: null,
                        pedidoSucesso,
                        avisoPedidos: 'Nenhum cliente cadastrado ainda. Importe o seed para liberar o histórico.',
                        isAdmin: false
                    });
                }

                const whereClause = isAdmin ? '' : 'WHERE p.id_cliente = ?';
                const queryParams = isAdmin ? [] : [clienteId];
                const filtrosAdmin = [];
                const parametrosAdmin = [];

                if (isAdmin && buscaPedidos) {
                    filtrosAdmin.push('(CAST(p.id_pedido AS CHAR) LIKE ? OR c.nome LIKE ? OR c.email LIKE ? OR p.status_pedido LIKE ?)');
                    const termoBusca = `%${buscaPedidos}%`;
                    parametrosAdmin.push(termoBusca, termoBusca, termoBusca, termoBusca);
                }

                const clausulaAdmin = filtrosAdmin.length > 0 ? `WHERE ${filtrosAdmin.join(' AND ')}` : '';

                const [linhas] = await connection.query(
                    `SELECT
                        p.id_pedido,
                        p.data_compra,
                        p.status_pedido,
                        p.valor_total,
                        p.metodo_pagamento,
                        c.nome AS nome_cliente,
                        c.email AS email_cliente,
                        i.id_item,
                        i.quantidade_comprada,
                        i.preco_congelado,
                        pr.nome AS nome_produto
                    FROM Pedido p
                    INNER JOIN Cliente c ON c.id_cliente = p.id_cliente
                    LEFT JOIN Item_Pedido i ON i.id_pedido = p.id_pedido
                    LEFT JOIN Produto pr ON pr.id_produto = i.id_produto
                    ${isAdmin ? clausulaAdmin : whereClause}
                    ORDER BY p.data_compra DESC, p.id_pedido DESC, i.id_item ASC`,
                    isAdmin ? parametrosAdmin : queryParams
                );

                const pedidos = agruparPedidos(linhas);
                const pedidoIdSelecionado = Number(req.query.id || 0);
                const pedidoSelecionado = pedidos.find((pedido) => pedido.id_pedido === pedidoIdSelecionado) || null;
                const title = isAdmin ? 'Nexus Store - Todos os Pedidos' : 'Nexus Store - Meus Pedidos';

                res.render('pedidos/pedidos', {
                    title,
                    pedidos,
                    pedidoSelecionado,
                    pedidoSucesso,
                    avisoPedidos: isAdmin ? 'Você está visualizando todos os pedidos do sistema.' : '',
                    isAdmin,
                    buscaPedidos
                });
            } finally {
                connection.release();
            }
        } catch (erro) {
            console.error('Erro ao carregar pedidos:', erro);
            res.status(500).send('Nao foi possivel carregar os pedidos.');
        }
    },

    exibirCarrinho: (req, res) => {
        const carrinho = normalizarCarrinho(req);
        const resumo = calcularResumo(carrinho);
        const erroCarrinho = req.session.erroCarrinho || '';

        req.session.erroCarrinho = '';

        res.render('pedidos/carrinho', {
            title: 'Nexus Store - Carrinho',
            carrinho,
            totalItens: resumo.totalItens,
            valorTotal: resumo.valorTotal.toFixed(2).replace('.', ','),
            erroCarrinho
        });
    },

    exibirPagamento: (req, res) => {
        const carrinho = normalizarCarrinho(req);

        if (carrinho.length === 0) {
            return res.redirect('/carrinho');
        }

        const resumo = calcularResumo(carrinho);
        const metodoSelecionado = req.query.metodo || 'cartao';

        res.render('pedidos/pagamento', {
            title: 'Nexus Store - Pagamento',
            carrinho,
            totalItens: resumo.totalItens,
            valorTotal: resumo.valorTotal.toFixed(2).replace('.', ','),
            metodoSelecionado
        });
    },

    adicionarAoCarrinho: (req, res) => {
        const carrinho = normalizarCarrinho(req);
        const idProduto = Number(req.body.id_produto);
        const nome = String(req.body.nome || '').trim();
        const urlFoto = String(req.body.url_foto || '').trim();
        const quantidade = Math.max(1, Number(req.body.quantidade || 1));
        const preco = Number(req.body.preco);

        if (!idProduto || !nome || Number.isNaN(preco)) {
            return res.redirect('/');
        }

        const itemExistente = carrinho.find((item) => Number(item.id_produto) === idProduto);

        if (itemExistente) {
            itemExistente.quantidade_comprada += quantidade;
        } else {
            carrinho.push({
                id_produto: idProduto,
                nome,
                preco,
                quantidade_comprada: quantidade,
                url_foto: urlFoto
            });
        }

        req.session.carrinho = carrinho;
        res.redirect('/carrinho');
    },

    aumentarQuantidade: (req, res) => {
        const carrinho = normalizarCarrinho(req);
        const idProduto = Number(req.params.id_produto);
        const item = carrinho.find((produto) => Number(produto.id_produto) === idProduto);

        if (item) {
            item.quantidade_comprada += 1;
        }

        res.redirect('/carrinho');
    },

    diminuirQuantidade: (req, res) => {
        const carrinho = normalizarCarrinho(req);
        const idProduto = Number(req.params.id_produto);
        const indice = carrinho.findIndex((produto) => Number(produto.id_produto) === idProduto);

        if (indice >= 0) {
            if (carrinho[indice].quantidade_comprada > 1) {
                carrinho[indice].quantidade_comprada -= 1;
            } else {
                carrinho.splice(indice, 1);
            }
        }

        res.redirect('/carrinho');
    },

    removerDoCarrinho: (req, res) => {
        const carrinho = normalizarCarrinho(req);
        const idProduto = Number(req.params.id_produto);

        req.session.carrinho = carrinho.filter((item) => Number(item.id_produto) !== idProduto);
        res.redirect('/carrinho');
    },

    limparCarrinho: (req, res) => {
        req.session.carrinho = [];
        res.redirect('/carrinho');
    },

    atualizarStatusPedido: async (req, res) => {
        if (!exigirAdmin(req)) {
            return res.status(403).send('Acesso negado.');
        }

        const idPedido = Number(req.params.id_pedido);
        const status = statusPedidoValido(req.body.status_pedido);

        if (!idPedido || !status) {
            req.session.pedidoSucesso = 'Pedido não atualizado. Status inválido.';
            return res.redirect('/pedidos');
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [linhas] = await connection.query(
                'SELECT id_pedido FROM Pedido WHERE id_pedido = ? FOR UPDATE',
                [idPedido]
            );

            if (linhas.length === 0) {
                await connection.rollback();
                req.session.pedidoSucesso = 'Pedido não encontrado.';
                return res.redirect('/pedidos');
            }

            await connection.query(
                'UPDATE Pedido SET status_pedido = ? WHERE id_pedido = ?',
                [status, idPedido]
            );

            await connection.commit();
            req.session.pedidoSucesso = `Pedido #${idPedido} atualizado para ${status}.`;
            return res.redirect(`/pedidos?id=${idPedido}`);
        } catch (erro) {
            await connection.rollback();
            console.error('Erro ao atualizar pedido:', erro);
            req.session.pedidoSucesso = 'Não foi possível atualizar o pedido.';
            return res.redirect('/pedidos');
        } finally {
            connection.release();
        }
    },

    excluirPedido: async (req, res) => {
        if (!exigirAdmin(req)) {
            return res.status(403).send('Acesso negado.');
        }

        const idPedido = Number(req.params.id_pedido);

        if (!idPedido) {
            req.session.pedidoSucesso = 'Pedido inválido.';
            return res.redirect('/pedidos');
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [linhas] = await connection.query(
                'SELECT id_pedido FROM Pedido WHERE id_pedido = ? FOR UPDATE',
                [idPedido]
            );

            if (linhas.length === 0) {
                await connection.rollback();
                req.session.pedidoSucesso = 'Pedido não encontrado.';
                return res.redirect('/pedidos');
            }

            await connection.query('DELETE FROM Pedido WHERE id_pedido = ?', [idPedido]);

            await connection.commit();
            req.session.pedidoSucesso = `Pedido #${idPedido} removido com sucesso.`;
            return res.redirect('/pedidos');
        } catch (erro) {
            await connection.rollback();
            console.error('Erro ao excluir pedido:', erro);
            req.session.pedidoSucesso = 'Não foi possível excluir o pedido.';
            return res.redirect('/pedidos');
        } finally {
            connection.release();
        }
    },

    adicionarTeste: (req, res) => {
        req.session.carrinho = [
            {
                id_produto: 3,
                nome: 'Fone de Ouvido JBL',
                preco: 299.9,
                quantidade_comprada: 1,
                url_foto: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
            }
        ];

        res.redirect('/carrinho');
    },

    finalizarPedido: async (req, res) => {
        const carrinho = normalizarCarrinho(req);

        if (carrinho.length === 0) {
            return res.redirect('/carrinho');
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const clienteId = await obterClienteId(connection, req);
            if (!clienteId) {
                throw new Error('Nenhum cliente encontrado. Importe o seed antes de finalizar pedidos.');
            }
            const itensCarrinho = agruparItensCarrinho(carrinho);
            const idsProdutos = itensCarrinho.map((item) => item.id_produto);

            if (idsProdutos.length === 0) {
                throw new Error('Carrinho sem produtos validos.');
            }

            const placeholders = idsProdutos.map(() => '?').join(',');
            const [produtosBanco] = await connection.query(
                `SELECT id_produto, nome, preco, quantidade_estoque FROM Produto WHERE id_produto IN (${placeholders}) FOR UPDATE`,
                idsProdutos
            );

            const produtosPorId = new Map(produtosBanco.map((produto) => [Number(produto.id_produto), produto]));

            const itensFinalizados = itensCarrinho.map((item) => {
                const produtoBanco = produtosPorId.get(Number(item.id_produto));

                if (!produtoBanco) {
                    throw new Error(`Produto ${item.id_produto} nao encontrado no banco.`);
                }

                const quantidade = Math.max(1, Number(item.quantidade_comprada || 1));
                if (quantidade > Number(produtoBanco.quantidade_estoque || 0)) {
                    const erroEstoque = new Error(`Estoque insuficiente para ${produtoBanco.nome}. Disponivel: ${produtoBanco.quantidade_estoque}.`);
                    erroEstoque.statusCode = 400;
                    throw erroEstoque;
                }

                const precoUnitario = Number(item.preco || produtoBanco.preco);

                return {
                    id_produto: produtoBanco.id_produto,
                    nome: produtoBanco.nome,
                    quantidade,
                    precoUnitario,
                    totalItem: Number((precoUnitario * quantidade).toFixed(2))
                };
            });

            const valorTotal = Number(
                itensFinalizados.reduce((soma, item) => soma + item.totalItem, 0).toFixed(2)
            );

            const metodoPagamento = String(req.body.metodo || req.body.metodo_pagamento || 'cartao').trim();

            const [resultadoPedido] = await connection.query(
                'INSERT INTO Pedido (id_cliente, data_compra, status_pedido, metodo_pagamento, valor_total) VALUES (?, NOW(), ?, ?, ?)',
                [clienteId, 'Recebido', metodoPagamento, valorTotal]
            );

            const idPedido = resultadoPedido.insertId;

            for (const item of itensFinalizados) {
                await connection.query(
                    'UPDATE Produto SET quantidade_estoque = quantidade_estoque - ? WHERE id_produto = ?',
                    [item.quantidade, item.id_produto]
                );

                await connection.query(
                    'INSERT INTO Item_Pedido (id_pedido, id_produto, quantidade_comprada, preco_congelado, valor_item_total) VALUES (?, ?, ?, ?, ?)',
                    [idPedido, item.id_produto, item.quantidade, item.precoUnitario, item.totalItem]
                );
            }

            await connection.commit();
            req.session.carrinho = [];
            req.session.erroCarrinho = '';
            req.session.pedidoSucesso = `Pedido #${idPedido} finalizado com sucesso.`;
            res.redirect(`/pedidos?id=${idPedido}`);
        } catch (erro) {
            await connection.rollback();
            console.error('Erro ao finalizar pedido:', erro);
            req.session.erroCarrinho = erro.message || 'Nao foi possivel finalizar o pedido.';
            res.redirect('/carrinho');
        } finally {
            connection.release();
        }
    }
};

module.exports = PedidosController;