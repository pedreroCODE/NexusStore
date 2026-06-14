const express = require('express');
const router = express.Router();
const PedidosController = require('../src/controllers/PedidoController');

// Define as rotas oficiais
router.get('/carrinho', PedidosController.exibirCarrinho);
router.get('/pedidos', PedidosController.exibirPedidos);
router.post('/carrinho/adicionar', PedidosController.adicionarAoCarrinho);
router.get('/carrinho/aumentar/:id_produto', PedidosController.aumentarQuantidade);
router.get('/carrinho/diminuir/:id_produto', PedidosController.diminuirQuantidade);
router.get('/carrinho/remover/:id_produto', PedidosController.removerDoCarrinho);
router.post('/pedidos/finalizar', PedidosController.finalizarPedido);

// Define as rotas de manipulação (testes)
router.get('/carrinho/add-teste', PedidosController.adicionarTeste);
router.get('/carrinho/limpar', PedidosController.limparCarrinho);

module.exports = router;