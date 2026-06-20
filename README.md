A Nexus Store é um sistema web full-stack desenvolvido como um e-commerce. O projeto foi estruturado seguindo o padrão arquitetural MVC (Model-View-Controller) e utiliza renderização dinâmica no servidor com views em EJS, persistência de dados em banco relacional MySQL e controle de autenticação seguro.

Tecnologias Utilizadas

Backend: Node.js com o framework Express.
Banco de Dados: MySQL (utilizando o driver profissional `mysql2` para suporte a Promises/Async-Await).
View Engine: EJS (Embedded JavaScript) com parciais estruturadas para reaproveitamento de layout.
Sessões e Estado: `express-session` para gerenciamento do carrinho de compras e controle de login.
Segurança: `bcrypt` para a criptografia e hashing de senhas antes da gravação no banco de dados.
Design Visual: Bootstrap 5.3 acoplado ao Bootstrap Icons para uma interface administrativa moderna e responsiva.

Estrutura do Projeto (Padrão MVC)


NEXUSSTORE-MAIN
├── public/
│   └── imagens/
│       ├── logo.png
│       └── logo2.png
├── src/                      
│   ├── controllers/
│   │   ├── clienteController.js
│   │   ├── ClienteController.js
│   │   └── PedidoController.js
│   ├── database/
│   │   └── conexao.js
│   │   └── schema.sql
│   │   └── seed-expanded.sql
│   ├── routes/
│   │   └── pedidosRoutes.js  
│   └── views/
│       ├── categorias/
│       │   └── cadastro.js
│       │   └── listar.js
│       ├── carrinho/
│       │   └── editar.js
│       │   └── listar.js
│       ├── layouts/
│       │   └── index.js
│       │   └── login.js
│       ├── partials/
│       │   └── footer.js
│       │   └── header.js
│       ├── pedidos/
│       │   └── carrinho.js
│       │   └── pagamento.js
│       │   └── pedidos.js
│       ├── produtos/
│       │   └── cadastro.js
│       │   └── listar.js
│       └── minhaconta.ejs
├── app.js
├── package.json
├── package-lock.json
├── README.md
└── usoIA.md