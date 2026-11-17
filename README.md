# D-Link

Plataforma web desenvolvida com o objetivo de aproximar candidatos surdos de empresas que oferecem oportunidades de trabalho inclusivas.

O D-Link permite o gerenciamento de perfis, vagas e candidaturas, com foco em acessibilidade e segurança das informações dos usuários.

## Tecnologias utilizadas

### Frontend

- React.js
- TypeScript
- React Router
- Axios
- Context API

### Backend

- Node.js
- Express.js
- TypeScript
- JWT para autenticação
- Prisma ORM

### Banco de dados

- PostgreSQL

### Ferramentas

- GitHub — versionamento e hospedagem do código
- Bolt.new — prototipação visual das interfaces
- GitHub Actions — CI/CD
- ESLint — análise e padronização do código
- CodeQL — análise de segurança

## Arquitetura

O projeto utiliza **Clean Architecture**, buscando separar as responsabilidades da aplicação e facilitar a manutenção e evolução do sistema.

A aplicação é dividida principalmente em três partes:

```text
D-Link
│
├── Frontend
│   ├── React
│   ├── TypeScript
│   ├── React Router
│   └── Axios
│
├── Backend
│   ├── Node.js
│   ├── Express
│   ├── Controllers
│   ├── Services
│   ├── Repositories
│   └── JWT
│
└── Banco de Dados
    └── PostgreSQL
        └── Prisma ORM
```

### Frontend

Responsável pela interface do sistema e pela interação com os usuários.

O frontend é desenvolvido como uma aplicação web utilizando React e TypeScript. O React Router é utilizado para o gerenciamento das rotas e o Axios para comunicação com a API.

### Backend

Responsável pelas regras de negócio, autenticação e gerenciamento das funcionalidades da plataforma.

A API é desenvolvida utilizando Node.js e Express.js, seguindo uma organização baseada em:

- **Controllers:** recebem e tratam as requisições HTTP;
- **Services:** concentram as regras de negócio;
- **Repositories:** realizam a comunicação com o banco de dados através do Prisma.

### Banco de dados

O PostgreSQL é utilizado para persistência dos dados da aplicação.

O acesso ao banco é realizado através do **Prisma ORM**, proporcionando uma camada de abstração entre a aplicação e o banco de dados.

## Comunicação

A comunicação entre frontend e backend ocorre através de uma **API REST**, utilizando JSON sobre HTTPS.

```text
Usuário
   │
   ▼
Frontend
React + TypeScript
   │
   │ HTTP/HTTPS
   │ JSON
   ▼
Backend
Node.js + Express
   │
   │ Prisma ORM
   ▼
PostgreSQL
```

## Segurança

O projeto utiliza autenticação baseada em **JWT**, permitindo o controle de acesso de acordo com o perfil do usuário.

Também são consideradas boas práticas de segurança baseadas no **OWASP Top 10**, além de análise estática do código e verificação das dependências utilizadas no projeto.

Por trabalhar com dados pessoais e informações relacionadas à deficiência auditiva, o projeto também considera princípios da **LGPD**, principalmente em relação ao armazenamento, acesso e proteção dos dados dos usuários.

## Testes e CI/CD

O projeto possui uma estratégia de testes automatizados e integração contínua.

O pipeline de CI/CD é utilizado para executar verificações de código, testes, build e análises de segurança antes da disponibilização das alterações.

A estratégia de testes definida no projeto considera como objetivo mínimo:

- 75% de cobertura no Backend;
- 25% de cobertura no Frontend.

## Instalação

### Pré-requisitos

- Node.js
- PostgreSQL
- Git
- npm

### Clone o projeto

```bash
git clone https://github.com/AndreyGarcia01/Dlink.git
cd Dlink
```

### Instale as dependências

```bash
npm install
```

Caso o frontend e o backend estejam separados, execute o comando de instalação dentro de cada diretório.

### Configure as variáveis de ambiente

Crie um arquivo `.env` no backend:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dlink"
JWT_SECRET="sua_chave_secreta"
PORT=3000
```

### Configure o banco

```bash
npx prisma migrate dev
```

### Execute o projeto

```bash
npm run dev
```

## Protótipo

O protótipo visual utilizado como referência para o desenvolvimento das interfaces foi criado utilizando o Bolt.new.

https://d-link-deaf-employab-hk0z.bolt.host/

## Projeto acadêmico

**D-Link — Web App**

Projeto desenvolvido para o curso de Engenharia de Software do Centro Universitário Católica de Santa Catarina.

**Autor:** Andrey Garcia dos Santos

**PAC VII — Projeto de Aplicação de Conhecimentos**
