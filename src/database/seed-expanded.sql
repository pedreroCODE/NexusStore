INSERT INTO Categoria (id_categoria, nome, descricao_categoria, descricao_completa_categoria, status) VALUES
(1, 'Eletrônicos', 'Tecnologia e acessórios', 'Linha ampliada para testes de catálogo e pedidos', TRUE),
(2, 'Casa e Cozinha', 'Itens domésticos', 'Produtos para simular variedade de compra', TRUE),
(3, 'Escritório', 'Acessórios profissionais', 'Linha usada para pedidos maiores', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome), descricao_categoria = VALUES(descricao_categoria), descricao_completa_categoria = VALUES(descricao_completa_categoria), status = VALUES(status);

INSERT INTO Cliente (id_cliente, nome, email, senha, telefone, cep, rua, numero, bairro, cidade, estado) VALUES
(1, 'Cliente Demo', 'demo@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Administrador Nexus', 'admin@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Ana Souza', 'ana.souza@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', '11999990001', 12345000, 'Rua A', 10, 'Centro', 'São Paulo', 'SP'),
(4, 'Bruno Lima', 'bruno.lima@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', '21999990002', 20040000, 'Rua B', 20, 'Copacabana', 'Rio de Janeiro', 'RJ'),
(5, 'Carla Mendes', 'carla.mendes@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', '31999990003', 30030000, 'Rua C', 30, 'Savassi', 'Belo Horizonte', 'MG')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha), telefone = VALUES(telefone), cep = VALUES(cep), rua = VALUES(rua), numero = VALUES(numero), bairro = VALUES(bairro), cidade = VALUES(cidade), estado = VALUES(estado);

INSERT INTO Produto (id_produto, id_categoria, nome, descricao_produto, preco, quantidade_estoque, url_foto) VALUES
(1, 1, 'Smartphone Galaxy A54', 'Smartphone de entrada para testes', 1999.00, 45, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'),
(2, 1, 'Notebook Dell Inspiron', 'Notebook para testes', 3499.00, 18, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'),
(3, 1, 'Fone de Ouvido JBL', 'Fone de ouvido para testes', 299.90, 60, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
(4, 2, 'Cafeteira Elétrica', 'Cafeteira compacta', 189.90, 25, 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400'),
(5, 2, 'Liquidificador Inox', 'Liquidificador potente', 249.90, 20, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400'),
(6, 2, 'Air Fryer 4L', 'Fritadeira sem óleo', 399.90, 32, 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400'),
(7, 3, 'Mouse Sem Fio', 'Mouse ergonômico', 79.90, 80, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
(8, 3, 'Teclado Mecânico', 'Teclado gamer compacto', 289.90, 40, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400'),
(9, 3, 'Monitor 24 polegadas', 'Monitor Full HD', 899.90, 16, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
(10, 3, 'Cadeira Ergonômica', 'Cadeira para escritório', 1299.90, 12, 'https://images.unsplash.com/photo-1505843490701-5a49e8c4b8b0?w=400')
ON DUPLICATE KEY UPDATE id_categoria = VALUES(id_categoria), nome = VALUES(nome), descricao_produto = VALUES(descricao_produto), preco = VALUES(preco), quantidade_estoque = VALUES(quantidade_estoque), url_foto = VALUES(url_foto);

INSERT INTO Pedido (id_pedido, id_cliente, data_compra, status_pedido, valor_total) VALUES
(1, 1, '2026-06-01 10:20:00', 'Recebido', 2298.90),
(2, 1, '2026-06-03 15:45:00', 'Entregue', 189.90),
(3, 3, '2026-06-04 09:10:00', 'Em Transporte', 419.80),
(4, 4, '2026-06-05 18:30:00', 'Recebido', 1589.70),
(5, 5, '2026-06-06 11:00:00', 'Cancelado', 299.90),
(6, 2, '2026-06-07 14:15:00', 'Entregue', 2599.80),
(7, 2, '2026-06-08 16:00:00', 'Recebido', 1679.70),
(8, 3, '2026-06-09 08:25:00', 'Entregue', 1099.80)
ON DUPLICATE KEY UPDATE id_cliente = VALUES(id_cliente), data_compra = VALUES(data_compra), status_pedido = VALUES(status_pedido), valor_total = VALUES(valor_total);

INSERT INTO Item_Pedido (id_item, id_pedido, id_produto, quantidade_comprada, preco_congelado, valor_item_total) VALUES
(1, 1, 1, 1, 1999.00, 1999.00),
(2, 1, 3, 1, 299.90, 299.90),
(3, 2, 4, 1, 189.90, 189.90),
(4, 3, 6, 1, 399.90, 399.90),
(5, 3, 7, 1, 79.90, 79.90),
(6, 4, 2, 1, 3499.00, 3499.00),
(7, 4, 7, 2, 79.90, 159.80),
(8, 5, 3, 1, 299.90, 299.90),
(9, 6, 5, 1, 249.90, 249.90),
(10, 6, 8, 1, 289.90, 289.90),
(11, 7, 9, 1, 899.90, 899.90),
(12, 7, 10, 1, 1299.90, 1299.90),
(13, 8, 6, 2, 399.90, 799.80),
(14, 8, 7, 4, 79.90, 319.60)
ON DUPLICATE KEY UPDATE id_pedido = VALUES(id_pedido), id_produto = VALUES(id_produto), quantidade_comprada = VALUES(quantidade_comprada), preco_congelado = VALUES(preco_congelado), valor_item_total = VALUES(valor_item_total);