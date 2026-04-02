# ✂️ Aparatus — Agendamento Inteligente para Barbearias

![Status](https://img.shields.io/badge/status-ativo-22c55e?style=for-the-badge)
![Deploy](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

![Next.js](https://img.shields.io/badge/Next.js_16-111827?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-1E40AF?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-0ea5e9?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-1d4ed8?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

---

## 📖 Sobre o Projeto

O **Aparatus** é uma plataforma full-stack de agendamento para barbearias, com integração de pagamentos via Stripe e um assistente virtual com inteligência artificial (Agenda.ai) que permite ao usuário agendar serviços por meio de uma conversa natural.

O projeto combina uma interface moderna com funcionalidades robustas:

- Busca e navegação por barbearias e serviços
- Agendamento com calendário e seleção de horários disponíveis
- Chat com IA para agendamento assistido via linguagem natural
- Pagamento seguro via Stripe Checkout
- Cancelamento com reembolso automático
- Autenticação social com Google OAuth

---

## ✨ Funcionalidades

### 🔍 Busca de Barbearias

- Campo de busca por nome de serviço
- Botões de busca rápida por categoria (Cabelo, Barba, Acabamento, Sobrancelha, Pézinho)
- Grid de resultados com cards informativos

### 💈 Página da Barbearia

- Banner com imagem, nome, endereço e avaliação
- Descrição ("Sobre nós")
- Lista de serviços com nome, descrição e preço
- Telefones com botão de copiar para a área de transferência

### 📅 Agendamento via Interface

- Seleção de serviço abre painel lateral
- Calendário interativo para escolha do dia
- Time slots disponíveis (09:00 às 18:00, intervalos de 45 minutos)
- Filtragem automática de horários ocupados e já passados
- Resumo da reserva com preço em BRL antes da confirmação
- Redirecionamento para Stripe Checkout ao confirmar

### 🤖 Chat com IA — Agenda.ai

- Assistente virtual com GPT-4o-mini via Vercel AI SDK
- Interface de chat em tempo real com streaming de respostas
- A IA busca barbearias, consulta disponibilidade e inicia o pagamento
- Botão de pagamento renderizado automaticamente no chat após confirmação
- Ferramentas (tools) disponíveis para a IA:
  - `searchBarbershops` — busca barbearias por nome
  - `getAvailableTimeSlotsForBarbershop` — verifica horários disponíveis
  - `createBookingCheckoutSession` — inicia sessão de checkout no Stripe

### 💳 Pagamento via Stripe

- Checkout Sessions em modo `payment` com moeda BRL
- Webhook (`checkout.session.completed`) cria o agendamento no banco automaticamente
- Verificação de idempotência para evitar duplicidade

### ❌ Cancelamento e Reembolso

- Validações de propriedade, duplicidade e data
- Reembolso automático via Stripe quando aplicável
- Soft delete com campo `cancelledAt`

### 📋 Meus Agendamentos

- Separação entre **Confirmados** (futuros) e **Finalizados** (passados ou cancelados)
- Detalhes do agendamento com mapa, telefones e opção de cancelar
- Notificação de sucesso ao retornar do pagamento

### 🔐 Autenticação

- Login social via Google OAuth com Better Auth
- Avatar, nome e e-mail exibidos no menu lateral
- Proteção de rotas e server actions via sessão

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| **Next.js** | 16.1.1 | Framework full-stack (App Router) |
| **React** | 19.2.3 | Biblioteca de UI |
| **TypeScript** | ^5 | Tipagem estática |
| **Tailwind CSS** | ^4 | Estilização utilitária |
| **Prisma** | 7.1.0 | ORM com adapter nativo para PostgreSQL |
| **PostgreSQL** | 15 | Banco de dados relacional (via Docker) |
| **Better Auth** | 1.4.6 | Autenticação (Google OAuth) |
| **Stripe** | 18.4.0 | Pagamentos e reembolsos |
| **Vercel AI SDK** | 5.0.112 | Chat com IA e streaming |
| **@ai-sdk/openai** | 2.0.85 | Provider OpenAI (GPT-4o-mini) |
| **TanStack React Query** | 5.90.12 | Data fetching e cache client-side |
| **next-safe-action** | 8.0.11 | Server actions type-safe |
| **Radix UI** | — | Componentes headless (Dialog, Avatar, Sheet) |
| **react-day-picker** | ^9.13.0 | Calendário interativo |
| **Streamdown** | 1.6.10 | Renderização de streaming markdown |
| **date-fns** | ^4.1.0 | Manipulação de datas |
| **Sonner** | ^2.0.7 | Toast notifications |
| **Lucide React** | ^0.561.0 | Ícones |
| **Zod** | 4.1.13 | Validação de schemas |
| **ESLint** | ^9 | Linting |
| **Prettier** | 3.6.2 | Formatação (com plugin Tailwind) |

---

## 🧱 Estrutura do Projeto

```
aparatus/
├── app/
│   ├── layout.tsx                  # Root layout (fontes, providers, footer)
│   ├── page.tsx                    # Homepage
│   ├── globals.css
│   ├── api/
│   │   ├── auth/[...all]/route.ts  # Better Auth handler
│   │   ├── chat/route.ts           # API de chat com IA
│   │   └── stripe/webhook/route.ts # Webhook do Stripe
│   ├── barbershops/
│   │   ├── page.tsx                # Busca de barbearias
│   │   └── [id]/page.tsx           # Detalhe da barbearia
│   ├── bookings/
│   │   ├── page.tsx                # Agendamentos (Server Component)
│   │   └── bookings-client-page.tsx
│   └── chat/
│       ├── layout.tsx              # Layout sem footer
│       └── page.tsx                # Interface do Agenda.ai
├── actions/                        # Server Actions
│   ├── cancel-booking.ts
│   ├── create-booking.ts
│   ├── create-booking-checkout-session.ts
│   └── get-date-available-time-slots.ts
├── components/                     # Componentes reutilizáveis
│   ├── ui/                         # Componentes base (Button, Card, Sheet...)
│   ├── booking-sheet.tsx
│   ├── service-item.tsx
│   ├── header.tsx
│   └── menu-sheet.tsx
├── data/                           # Data Access Layer
│   ├── barbershops.ts
│   └── booking.ts
├── hooks/data/                     # React Query hooks
├── lib/                            # Utilitários e configurações
│   ├── auth.ts                     # Better Auth (server)
│   ├── auth-client.ts              # Better Auth (client)
│   ├── prisma.ts                   # Prisma Client
│   ├── action-client.ts            # next-safe-action client
│   └── utils.ts
├── prisma/
│   ├── schema.prisma               # Schema do banco
│   ├── seed.ts                     # Seed de dados
│   └── migrations/
├── generated/prisma/               # Prisma Client gerado
├── docker-compose.yml              # PostgreSQL local
├── package.json
└── tsconfig.json
```

---

## 🗄️ Modelo de Dados

```
Barbershop (1) ──→ (*) BarbershopService (1) ──→ (*) Booking
                                                       ↑
User (1) ─────────────────────────────────────→ (*) Booking
User (1) ──→ (*) Session
User (1) ──→ (*) Account
```

| Model | Campos Principais |
| --- | --- |
| **Barbershop** | id, name, address, description, imageUrl, phones[] |
| **BarbershopService** | id, name, description, priceInCents, imageUrl, barbershopId, deletedAt? |
| **Booking** | id, stripeChargeId?, serviceId, barbershopId, userId, date, cancelledAt? |
| **User** | id, name, email (unique), emailVerified, image? |
| **Session** | id, expiresAt, token (unique), userId |
| **Account** | id, accountId, providerId, userId, accessToken?, refreshToken? |
| **Verification** | id, identifier, value, expiresAt |

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:password@localhost:5432/aparatus"

# Autenticação (Google OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_SECRET=          # Mínimo 32 caracteres

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET_KEY=

# OpenAI
OPENAI_API_KEY=

# URL pública da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) (para o PostgreSQL)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (para webhooks locais)

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/DevRogerFer/aparatus.git
cd aparatus

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Preencha as variáveis no arquivo .env

# 4. Subir o banco de dados
docker compose up -d

# 5. Executar migrations
npx prisma migrate dev

# 6. Popular o banco com dados iniciais
pnpm dlx tsx prisma/seed.ts

# 7. Iniciar o servidor de desenvolvimento
pnpm dev

# 8. (Em outro terminal) Encaminhar webhooks do Stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📦 Scripts Disponíveis

| Script | Comando | Descrição |
| --- | --- | --- |
| `pnpm dev` | `next dev` | Servidor de desenvolvimento |
| `pnpm build` | `next build` | Build de produção |
| `pnpm start` | `next start` | Iniciar em produção |
| `pnpm lint` | `eslint` | Executar linting |
| `postinstall` | `prisma generate` | Gera Prisma Client automaticamente |

---

## ☁️ Deploy

O projeto está configurado para deploy na **Vercel**:

1. Conecte o repositório na [Vercel](https://vercel.com)
2. Configure todas as variáveis de ambiente no painel
3. Utilize um PostgreSQL externo (ex: [Neon](https://neon.tech), [Supabase](https://supabase.com))
4. Configure o webhook do Stripe apontando para a URL de produção (`/api/stripe/webhook`)
5. Atualize as URLs de callback do Google OAuth no [Google Cloud Console](https://console.cloud.google.com)

---

## 👨‍💻 Autor

**Rogério Fernandes Siqueira**

- LinkedIn: [linkedin.com/in/devrogerfer](https://www.linkedin.com/in/devrogerfer)
- GitHub: [github.com/DevRogerFer](https://github.com/DevRogerFer)

---

Se este projeto te ajudou ou inspirou, deixe uma estrela no repositório. ⭐
