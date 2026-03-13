# Merchants Management Board

Portal de gestão de merchants da Yuno com Kanban boards, acompanhamento de demandas técnicas, implementações e NPS.

## Stack

- **Frontend:** HTML + CSS + JavaScript (vanilla, zero dependências)
- **Arquivo único:** `index.html` — sem build, sem framework, sem backend
- **Persistência:** `localStorage` (dados salvos no navegador)
- **i18n:** Português (PT-BR), English (EN), Español (ES)

## Como rodar

```bash
# Qualquer servidor estático serve. Exemplo com Python:
python3 -m http.server 8080 --directory .

# Acesse:
# http://localhost:8080
```

Não precisa de `npm install`, `yarn`, `build` ou qualquer setup. Basta servir o arquivo.

## Credenciais de teste

| Perfil | Email | Senha |
|--------|-------|-------|
| **Admin** | `sarah@y.uno` | `yuno123` |
| **Merchant** | `debora@q2ingressos.com.br` | `q2123` |

Os campos já vêm preenchidos na tela de login. Use o toggle **Administrador / Merchant** para alternar.

## Funcionalidades

### Visão Admin
- **Tabela de Merchants** — busca, filtros, ordenação, colunas redimensionáveis, edição inline
- **TAM — Demandas Técnicas** — CRUD de demandas por merchant com prioridade e status
- **Metas Gerais e Específicas** — quadro de metas com gráficos Canvas (barras de status e % atingido)

### Visão Merchant (Kanban Boards)
- **Feature Requests** — Backlog → Em análise → Aprovado → Em desenvolvimento → Concluído
- **Demanda Técnica** — Novo → Em andamento → Aguardando Merchant → Aguardando Tech → Concluído
- **Projetos e Consultorias** — Ideia → Em análise → Proposta enviada → Em execução → Entregue
- **Implementação** — Setup Técnico → Configuração → Testes → Homologação → Go-live
- **NPS** — Acompanhamento de satisfação (em desenvolvimento)

### Kanban — Recursos
- Drag-and-drop nativo (HTML5) entre colunas
- Criar, renomear e excluir colunas
- Criar cartões com título, descrição e prioridade
- Painel lateral slide-out com detalhes do cartão
- Comentários com timeline
- Toggle "Aguardando merchant"
- Mover cartão via dropdown no painel de detalhes
- Persistência automática via localStorage
- Atalho: `Esc` fecha o painel lateral

## Estrutura

```
gestao-merchants/
└── index.html    # App completo (HTML + CSS + JS)
```

## Idiomas

Alterne entre PT / EN / ES nos botões de idioma na tela de login. A tradução cobre navegação, labels e textos da interface.

## Próximos passos

- [ ] Backend (API + banco de dados)
- [ ] Conteúdo da seção NPS
- [ ] Autenticação real
- [ ] Multi-tenant (múltiplos merchants)
