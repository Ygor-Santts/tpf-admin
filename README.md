# TPF Admin

Painel de administração do **Trampo Fácil**, separado do app. Feito com [Vue 3](https://vuejs.org/), [Vite](https://vitejs.dev/) e [Tailwind](https://tailwindcss.com/), usando a mesma API do app ([tpf-api](https://github.com/Ygor-Santts/tpf-api)).

- **Categorias**: o que os trabalhadores adicionam fica em "Para revisar" até ser aprovado. Dá para aprovar, renomear, juntar com a certa (os trabalhadores passam para a que fica), mudar de categoria e apagar o que ninguém usa.
- **Usuários**: busca por nome, e-mail ou telefone, filtros (trabalhadores, clientes, desativados), detalhes da conta, desativar, reativar e excluir.

Só entra quem é admin. A API confere isso em toda chamada.

---

## 🚀 Rodar no seu PC

Com a [tpf-api](https://github.com/Ygor-Santts/tpf-api) rodando em `http://localhost:3000`:

```bash
npm install
npm run dev        # abre em http://localhost:5174
```

Entre com uma conta admin. Com os dados de teste da API (`npm run seed`), `cliente01@teste.com` / `Teste@123` já é admin.

| Variável | Para quê | Padrão |
| --- | --- | --- |
| `VITE_API_URL` | Endereço da API | `http://localhost:3000` |
| `VITE_APP_URL` | Endereço do app, para o link "Ver perfil público" | `http://localhost:5173` |

## 👤 Dar acesso de admin a uma conta

Na tpf-api (no servidor, dentro de `~/tpf-api`):

```bash
docker compose --env-file .env.server -f docker-compose.server.yml exec api npm run admin -- seu@email.com
# para tirar: ... npm run admin -- seu@email.com --remover
```

---

## 🌐 Servidor (produção)

O admin roda no mesmo servidor da API, num container próprio, e abre em `https://admin.SEU_DOMINIO`. O Caddy da tpf-api cuida do HTTPS e passa as visitas para este container. O admin tem deploy próprio: um merge aqui não mexe na API nem no app, e vice-versa.

### 1. Domínio (Registro.br)

Em **DNS → Editar zona**, crie um registro do tipo **A** com o nome `admin` e o IP do servidor (o mesmo dos registros vazio e `api`).

### 2. Publicação automática

No GitHub, em **Settings → Secrets and variables → Actions** deste repositório, crie os mesmos três segredos que já existem na tpf-api e no tpf-app:

| Nome | Valor |
| --- | --- |
| `SERVER_HOST` | IP do servidor |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | a chave do deploy (no servidor: `cat ~/.ssh/github-deploy`) |

Depois disso, todo merge na `main` é compilado e publicado sozinho. Na primeira vez o deploy também baixa este repositório para `~/tpf-admin` no servidor. Para publicar sem um merge novo: **Actions → Deploy → Run workflow**.

Se o repositório ficar privado, o servidor precisa de um token do GitHub para baixar (veja "Publicação automática" no README da tpf-api).

### Subir à mão

```bash
git clone https://github.com/Ygor-Santts/tpf-admin.git ~/tpf-admin   # só na primeira vez
cd ~/tpf-admin && git pull
docker compose --env-file ../tpf-api/.env.server -f docker-compose.server.yml up -d --build
```

A tpf-api precisa estar rodando antes: o admin entra na rede Docker dela.
