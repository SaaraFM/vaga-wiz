# Roadmap

## Em andamento: enviar projeto ao GitHub (SaaraFM/descricao_vagas)

- [x] Lote 1: configs (.gitignore, package.json, tsconfig, vite configs)
- [x] Lote 2: pages/ + public/robots.txt
- [x] Lote 3: núcleo PLN (src/lib/nlp/*) + eslint.config.js
- [x] Lote 4: src/lib/vagas/* (perguntas, gerador, gabaritos)
- [x] Lote 5: ChatVaga + PaginaVaga
- [x] Lote 6: PainelResultado
- [x] Lote 7: componentes ui/* + use-mobile + utils
- [x] Lote 8: styles.css + router + rotas
- [x] Lote 9: infra servidor (server.ts, start.ts, routeTree.gen, error libs)
- [x] Lote 10: tests/testes-pln.ts + python/preprocessamento.py + python/similaridade.py (árvore 086c39b7 criada; commit pendente — pai e2e7b4cf)
- [ ] Lote 11: python/gabaritos.py, gerador.py, chatbot.py, testes.py, requirements.txt
- [ ] Lote 12: README.md + .prettierrc + .prettierignore + bunfig.toml + components.json (+ AGENTS.md, src/routes/README.md)
- [ ] Workflow .github/workflows/deploy-pages.yml — BLOQUEADO: token OAuth sem escopo `workflow` (API retorna 404). Alternativas: usuário reconecta GitHub com escopo workflow, ou adiciona o arquivo manualmente.
- [ ] Verificar https://saarafm.github.io/descricao_vagas/ após push (depende do usuário ativar Pages → Source: GitHub Actions)
