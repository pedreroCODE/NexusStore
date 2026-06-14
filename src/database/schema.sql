
CREATE DATABASE IF NOT EXISTS nexus_store_db;
USE nexus_store_db;



CREATE TABLE IF NOT EXISTS Categoria (
    id_categoria INT AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao_categoria VARCHAR(255),
    descricao_completa_categoria TEXT,
    status BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_categoria)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS Cliente (
    id_cliente INT AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cep INT,
    rua VARCHAR(150),
    numero INT,
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    PRIMARY KEY (id_cliente)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS Produto (
    id_produto INT AUTO_INCREMENT,
    id_categoria INT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao_produto TEXT,
    preco FLOAT NOT NULL,
    quantidade_estoque INT NOT NULL,
    url_foto VARCHAR(255),
    PRIMARY KEY (id_produto),
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido INT AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    data_compra DATETIME NOT NULL,
    status_pedido VARCHAR(50) NOT NULL,
    metodo_pagamento VARCHAR(50) DEFAULT NULL,
    valor_total FLOAT NOT NULL,
    PRIMARY KEY (id_pedido),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS Item_Pedido (
    id_item INT AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade_comprada INT NOT NULL,
    preco_congelado FLOAT NOT NULL,
    valor_item_total FLOAT NOT NULL,
    PRIMARY KEY (id_item),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;



