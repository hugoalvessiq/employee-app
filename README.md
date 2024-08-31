# Employee Management App

Este é um aplicativo basico de aprendizado de programação, criando um sistema básico gestão de empregados que oferece um CRUD completo para informações de empregados, além de um sistema de cadastro e acesso por login. O aplicativo é dividido em duas partes: o backend em Rust e o frontend em React com ViteJS.

## Backend (Rust)

- **Tecnologias utilizadas:**
  - Actix Web: Framework web em Rust.
  - MongoDB: Banco de dados NoSQL para armazenar informações dos empregados.
  - Autenticação com JWT (JSON Web Tokens) para controle de acesso.

### Configuração

1. Clone este repositório.
2. Instale as dependências com `cargo build`.
3. Configure as variáveis de ambiente .env (por exemplo, para a conexão com o MongoDB("MONGODB_URL") e a chave secreta do JWT("SECRET_KEY")).
4. Execute o servidor com `cargo run`.
5. Execute o servidor com `cargo build --release` para versão de producão otimizada.

## Frontend (React com ViteJS)

- **Tecnologias utilizadas:**
  - React: Biblioteca JavaScript para construção de interfaces de usuário.
  - ViteJS: Ferramenta de desenvolvimento rápida para projetos React.
  - Axios: Biblioteca para fazer requisições HTTP.
  - React Router DOM: Gerenciamento de rotas no frontend.

### Configuração

1. Navegue até a pasta do frontend.
2. Instale as dependências com `npm install`.
3. Configure a URL base da API no arquivo de configuração (por exemplo, `src/api/api.jsx`).
4. Inicie o servidor de desenvolvimento com `npm run dev`.

## Licença

Este projeto está licenciado sob a MIT License.
