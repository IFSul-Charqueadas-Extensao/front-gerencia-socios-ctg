# Front-end — Gerência de Sócios CTG

Sistema web para gestão de sócios do **CTG Raízes da Tradição**, desenvolvido como projeto de extensão do IFSul - Câmpus Charqueadas. A aplicação permite visualizar, cadastrar e editar associados, acompanhar a situação de pagamentos e gerar relatórios.

---

## Sumário

1. [Tecnologias](#tecnologias)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação e execução](#instalação-e-execução)
4. [Scripts disponíveis](#scripts-disponíveis)
5. [Estrutura de pastas](#estrutura-de-pastas)
6. [Rotas da aplicação](#rotas-da-aplicação)
7. [Dados mock](#dados-mock)
8. [Integração com o backend](#integração-com-o-backend)
9. [Convenções de código](#convenções-de-código)
10. [Fluxo de contribuição](#fluxo-de-contribuição)

---

## Tecnologias

| Tecnologia | Versão | Papel |
|---|---|---|
| [React](https://react.dev) | 19 | Biblioteca de UI |
| [Vite](https://vite.dev) | 8 | Bundler e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Estilização utilitária (via plugin Vite) |
| [React Router DOM](https://reactrouter.com) | 7 | Roteamento client-side |
| [lucide-react](https://lucide.dev) | latest | Ícones SVG |
| [ESLint](https://eslint.org) | 9 | Linting (flat config) |

---

## Pré-requisitos

- **Node.js** >= 18 (recomendado: LTS mais recente)
- **npm** >= 9 (já vem com o Node)
- Git

Verifique sua versão:

```bash
node -v
npm -v
```

---

## Instalação e execução

```bash
# 1. Clone o repositório
git clone https://github.com/IFSul-Charqueadas-Extensao/front-gerencia-socios-ctg.git

# 2. Acesse a pasta
cd front-gerencia-socios-ctg

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em **http://localhost:5173**

> O Tailwind CSS v4 é carregado diretamente pelo plugin Vite — não é necessário nenhum arquivo `tailwind.config.js` ou `postcss.config.js`.

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Gera o bundle de produção em `dist/` |
| `npm run preview` | Serve o bundle de produção localmente para teste |
| `npm run lint` | Roda o ESLint em todos os arquivos `.js` e `.jsx` |

---

## Estrutura de pastas

```
front-gerencia-socios-ctg/
│
├── public/                      # Arquivos estáticos servidos na raiz
│
├── src/
│   ├── components/              # Componentes reutilizáveis
│   │   ├── Layout.jsx           # Wrapper de layout: Sidebar + área de conteúdo
│   │   ├── Sidebar.jsx          # Navegação lateral com ícones e responsividade mobile
│   │   ├── Badge.jsx            # Etiqueta colorida para status e categorias
│   │   ├── StatCard.jsx         # Card de indicador numérico com ícone
│   │   ├── EmptyState.jsx       # Estado vazio para listas sem resultados
│   │   ├── ModalDependente.jsx  # Modal de cadastro de dependente
│   │   └── ModalPagamento.jsx   # Modal de registro de pagamento mensal
│   │
│   ├── contexts/
│   │   └── ToastContext.jsx     # Contexto global de notificações (toast)
│   │
│   ├── data/
│   │   ├── mockData.js          # Dados estáticos temporários (substitui a API)
│   │   └── constants.js        # Constantes compartilhadas (ex: lista de invernadas)
│   │
│   ├── services/
│   │   └── sociosService.js     # Camada de acesso aos dados (abstrai mock/API)
│   │
│   ├── pages/                   # Uma página por rota
│   │   ├── Painel.jsx           # Visão geral: indicadores e listas rápidas
│   │   ├── Socios.jsx           # Listagem com filtros e tabela de sócios
│   │   ├── SocioDetalhe.jsx     # Edição de sócio individual + histórico de pagamentos
│   │   ├── NovoSocio.jsx        # Formulário de cadastro de novo sócio
│   │   └── Relatorios.jsx       # Geração e exportação de relatórios
│   │
│   ├── App.jsx                  # Definição das rotas (BrowserRouter + Routes)
│   ├── main.jsx                 # Ponto de entrada — monta o React na div#root
│   └── index.css                # @import "tailwindcss" + fonte Inter + estilos base
│
├── index.html                   # Entrada do Vite (não editar estrutura)
├── vite.config.js               # Configuração do Vite + plugins (React + Tailwind)
├── eslint.config.js             # ESLint flat config
├── package.json
└── README.md
```

---

## Rotas da aplicação

| Rota | Página | Descrição |
|---|---|---|
| `/` | `Painel` | Cards de indicadores (total, ativos, inadimplentes, novos) e listas rápidas |
| `/socios` | `Socios` | Tabela completa com filtros por nome, CPF, categoria, status e invernada |
| `/socios/novo` | `NovoSocio` | Formulário de cadastro com seção de dependentes (modal) |
| `/socios/:id` | `SocioDetalhe` | Dados editáveis do sócio + histórico de pagamentos por mês |
| `/relatorios` | `Relatorios` | Filtros para geração de relatório + exportação (Excel/Word/PDF) |

> A navegação entre rotas usa `react-router-dom`. A `Sidebar` usa `NavLink` para destacar automaticamente a página ativa.

---

## Dados mock

Enquanto o backend não está integrado, todos os dados vêm de **`src/data/mockData.js`**. O acesso aos dados é feito via **`src/services/sociosService.js`** — quando a API estiver pronta, basta atualizar o serviço sem alterar as páginas.

Estrutura de cada sócio:

```js
{
  id: 0,                          // índice usado nas rotas (/socios/:id)
  nome: 'Pedro Henrique Costa',
  cpf: '345.678.901-22',
  email: 'pedro.costa@email.com',
  telefone: '51999887766',        // somente dígitos
  data_nascimento: '2005-03-15',  // formato ISO (YYYY-MM-DD)
  endereco: 'Rua Santa Rita, 789 - Porto Alegre/RS',
  status: 'Ativo',                // 'Ativo' | 'Inativo'
  invernada: 'Juvenil',           // ver lista abaixo
  dependentes: 0,                 // número inteiro
  mensalidade: 'Em dia',          // 'Em dia' | 'Atrasado'
  data_entrada: '19/02/2026',     // formato DD/MM/AAAA
  ultimoPagamento: '30/11/2025',  // opcional — presente quando atrasado
  pagamentos: [                   // histórico mensal
    { mes: 'Março/2026', valor: 'R$ 80,00', status: 'Pago', data: '05/03/2026' }
    // status: 'Pago' | 'Pendente' | 'Atrasado'
  ]
}
```

**Invernadas disponíveis** (definidas em `src/data/constants.js`):
`Nenhuma`, `Pre Mirim`, `Mirim`, `Juvenil`, `Adulto`, `Veterano`, `Xiru`, `Chula`

---

## Integração com o backend

O backend esperado roda em `http://localhost:8080`. Para configurar a URL base sem hardcode, crie um arquivo `.env` na raiz:

```env
VITE_API_URL=http://localhost:8080
```

E acesse no código com:

```js
const BASE_URL = import.meta.env.VITE_API_URL
```

> Variáveis de ambiente no Vite precisam começar com `VITE_` para ficarem disponíveis no bundle do navegador.

O arquivo `.env` já está no `.gitignore` por padrão — **nunca comite credenciais**.

---

## Deploy no servidor da IFSul (Apache)

O frontend é uma SPA e precisa de passos específicos para funcionar no Apache.

### 1. Gerar o build de produção

Na raiz do projeto:

```bash
npm install
npm run build
```

Isso gera a pasta `dist/` com os arquivos estáticos prontos para produção.

### 2. Enviar para o servidor

Copie o **conteúdo** da pasta `dist/` para o diretório `ctg-raizes/` no servidor Apache:

```
/var/www/html/ctg-raizes/   ← pasta no servidor
```

A URL resultante será:
```
http://extensao.charqueadas.ifsul.edu.br/ctg-raizes/
```

### 3. Por que o `.htaccess` é necessário

O arquivo `public/.htaccess` (copiado automaticamente para o `dist/` pelo Vite) instrui o Apache a redirecionar todas as rotas para o `index.html`. Sem ele, acessar `/ctg-raizes/socios` diretamente no navegador retorna 404.

### 4. URL da API em produção

O arquivo `.env.production` já está configurado com a URL do backend da IFSul:

```ini
VITE_API_URL=http://php.charqueadas.ifsul.edu.br/back-ctgraizes/index.php/api
```

O Vite injeta essa variável automaticamente no build de produção — não é necessário nenhuma configuração extra no servidor.

> Para desenvolvimento local, o proxy configurado em `vite.config.js` redireciona `/api` para `http://localhost:8000` automaticamente ao rodar `npm run dev`.

---

## Convenções de código

- **JavaScript puro (JSX)** — sem TypeScript.
- **Tailwind utilitário** — toda estilização via classes Tailwind diretamente no JSX.
- **Cores principais:**
  - Azul navy (sidebar/títulos): `#1a3560`
  - Fundo da página: `#f0f2f5`
  - Botões de ação: `blue-600` (`#2563eb`)
- **Layout** — todas as páginas usam o componente `<Layout>` que inclui a `Sidebar`. Não adicione `Sidebar` diretamente nas páginas.
- **Notificações** — use `useToast()` do `ToastContext` para exibir mensagens de sucesso/erro. Não use `alert()` ou `confirm()` nativos do browser.
- **Estado local** — gerenciado com `useState` por página. Não há gerenciador de estado global.
- **Regra ESLint relevante** — variáveis não utilizadas são erro, exceto nomes em `MAIÚSCULAS` (ex: `INVERNADAS`).

---

## Fluxo de contribuição

1. Certifique-se de que `npm run build` passa sem erros antes de abrir PR.
2. Crie uma branch a partir de `main`:

```bash
git checkout -b feat/nome-da-feature
```

3. Faça commits descritivos com prefixo:

```bash
git commit -m "feat: adiciona filtro por invernada na tela de sócios"
git commit -m "fix: corrige cálculo de inadimplentes no Painel"
git commit -m "refactor: extrai lógica de datas para helper"
```

4. Abra um Pull Request para `main` no repositório do IFSul:
   `https://github.com/IFSul-Charqueadas-Extensao/front-gerencia-socios-ctg`

---

## Projeto de extensão

Desenvolvido no âmbito do **Instituto Federal Sul-rio-grandense (IFSul) — Câmpus Charqueadas**, com foco na formação prática dos estudantes e atendimento à comunidade tradicionalista gaúcha.
