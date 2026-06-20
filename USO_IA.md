# Relatório de Governança e Uso de Inteligência Artificial

Este documento cumpre as exigências do Manual do Projeto Prático da disciplina de Tópicos Especiais. Ele detalha, de forma transparente e crítica, como a Inteligência Artificial atuou como nossa assistente de engenharia e co-piloto de desenvolvimento no ecossistema da Nexus Store.


## Fases de Desenvolvimento Auxiliadas & Prompts Reais

###  1. Barra lateral para usuario e ADM
-"Tenho uma barra lateral estática em EJS. Preciso que quando o e-mail de administrador logar (que definimos como admin@nexus.local), o menu mude automaticamente para mostrar Produto, Categoria, Pedidos e Clientes, mantendo o meu design original em Bootstrap. Como faço essa amarração com sessões no Node?"*
- A IA nos forneceu a estrutura de validação por meio do `res.locals.usuarioLogado` injetado no middleware global do `app.js`. Nós adaptamos o retorno para ler diretamente a sessão gerada pelo `ClienteController.js` e mantivemos intactas as nossas classes CSS personalizadas da Nexus.

###  2. Sincronização Dinâmica do Cadastro de Produtos com a Home
- "O formulário do meu cadastro de produto já envia os inputs por POST para a rota /produtos/salvar e grava certinho no MySQL. Só que a minha tela inicial (index.ejs) ainda está com os cards de Smartphone, Fone e Notebook travados direto no código HTML. Como faço para a Home ler essa tabela do banco e listar os produtos novos que eu cadastrar?"
- A IA demonstrou a aplicação de uma query assíncrona com `db.query` acoplada à estrutura `produtos.forEach()` no HTML. Nós adaptamos o retorno gerado para garantir o tratamento do estoque (exibindo o botão desativado como "Esgotado" caso a quantidade seja 0) e protegemos a renderização injetando uma imagem padrão (`placeholder`) caso a URL da imagem estivesse em branco.

###  3. Resolução do Erro de Busca de Views (Express View Lookup)
- "Meu servidor está caindo e dando erro de 'Failed to lookup view' quando tento acessar a rota do carrinho logado como cliente comum. Vou te passar o erro completo do terminal e a forma como chamei a rota no app.js. Onde está o erro de caminho?"*
- A IA analisou o nosso arquivo de rotas e identificou que o Express realiza a busca a partir da pasta declarada em `app.set('views')`. O erro acontecia porque o nosso arquivo físico estava dentro de `views/pedidos/carrinho.ejs` e a chamada tentava ler `carrinho/carrinho`. Corrigimos o ponteiro da rota diretamente no `app.js` sem alterar a organização física de diretórios.


##  Análise Crítica da Experiência Coletiva

###  Vantagens
- Aceleração do Debug: O principal ganho foi a velocidade para interpretar os erros do Express (como o mapeamento incorreto das extensões das views de `.js` para `.ejs`), evitando que o grupo perdesse horas paralisado em detalhes de configuração local.
- Estruturação :Facilitou a montagem de dados simulados (como a lista de pedidos passados) no início da Sprint, permitindo testar o design do layout antes mesmo de finalizar todas as querys complexas do banco de dados.

### Desafios

- Incompatibilidade com a Estrutura Física de Pastas: Durante a resolução de problemas de navegação no Express, as respostas fornecidas indicavam rotas e caminhos de visualização (views) genéricos que não batiam com a árvore de diretórios real do nosso projeto. Isso gerou erros de execução na renderização do carrinho de compras, nos forçando a analisar e corrigir manualmente os ponteiros dentro do `app.js`.
- Desconexão com o Modelo Relacional do Banco de Dados: Nas etapas de integração dos formulários de cadastro (como o de produtos e categorias), as soluções propostas criavam parâmetros e nomenclaturas de campos que não existiam na nossa tabela oficial do MySQL (`schema.sql`). Tivemos que reescrever e amarrar os arrays de inputs manualmente para respeitar rigorosamente as chaves estrangeiras e a integridade do banco da Nexus Store.

