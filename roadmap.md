# Roadmap

## Consolidar repositórios GitHub (manter só descricao_vagas)

- [x] Projeto completo enviado a SaaraFM/descricao_vagas (main em 889cec1a)
- [x] Revisado SaaraFM/vaga-wiz: é o repositório criado pela sincronização do Lovable — mesmo projeto, inclui .github/workflows/deploy-pages.yml
- [ ] Apagar vaga-wiz — BLOQUEADO: a conexão não tem permissão de administrador para excluir repositórios (GitHub retornou 403). Usuário precisa apagar manualmente: github.com/SaaraFM/vaga-wiz → Settings → Danger Zone → Delete this repository.
- [ ] Workflow deploy-pages.yml no descricao_vagas — BLOQUEADO: token sem escopo `workflow` (404 ao criar arquivo em .github/workflows/). Usuário pode copiar o arquivo do vaga-wiz antes de apagá-lo, ou criar manualmente (conteúdo está no projeto local).
- [ ] Após apagar vaga-wiz: reconectar a sincronização do Lovable ao descricao_vagas (menu + → GitHub), pois a sync atual aponta para o vaga-wiz.
- [ ] Ativar GitHub Pages no descricao_vagas: Settings → Pages → Source: GitHub Actions.
