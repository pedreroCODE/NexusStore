INSERT INTO Categoria (id_categoria, nome, descricao_categoria, descricao_completa_categoria, status) VALUES
(1, 'Eletronicos', 'Produtos de tecnologia', 'Linha inicial de produtos para testes do carrinho e pedidos', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO Cliente (id_cliente, nome, email, senha, telefone, cep, rua, numero, bairro, cidade, estado) VALUES
(1, 'Cliente Demo', 'demo@nexus.local', '$2b$10$vLkdVxwsf6ccPkAThmmR4.bBqDh0iVr43Wv6AFcB59EJdO728PWfW', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE nome = VALUES(nome), email = VALUES(email), senha = VALUES(senha);

INSERT INTO Produto (id_produto, id_categoria, nome, descricao_produto, preco, quantidade_estoque, url_foto) VALUES
(1, 1, 'Smartphone Galaxy A54', 'Smartphone de entrada para testes', 1999.00, 15, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400'),
(2, 1, 'Notebook Dell Inspiron', 'Notebook para testes', 3499.00, 8, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400'),
(3, 1, 'Fone de Ouvido JBL', 'Fone de ouvido para testes', 299.90, 25, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400')
ON DUPLICATE KEY UPDATE nome = VALUES(nome), descricao_produto = VALUES(descricao_produto), preco = VALUES(preco), quantidade_estoque = VALUES(quantidade_estoque), url_foto = VALUES(url_foto);
