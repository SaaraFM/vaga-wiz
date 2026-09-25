# Roadmap

## Consolidar repositórios GitHub (manter só descricao_vagas)

- [x] Projeto completo enviado a SaaraFM/descricao_vagas (main em 889cec1a)
- [x] Revisado SaaraFM/vaga-wiz: é o repositório criado pela sincronização do Lovable — mesmo projeto, inclui .github/workflows/deploy-pages.yml
- [x] Workflow deploy-pages.yml criado no descricao_vagas (commit b2862085, após reconexão com escopo `workflow`)
- [x] GitHub Pages ativo (build_type: workflow) e site no ar: https://saarafm.github.io/descricao_vagas/ (HTTP 200, deploy com sucesso)
- [ ] Apagar vaga-wiz — BLOQUEADO: a conexão não tem permissão de administrador para excluir repositórios (GitHub retornou 403). Usuário precisa apagar manualmente: github.com/SaaraFM/vaga-wiz → Settings → Danger Zone → Delete this repository.
- [ ] Após apagar vaga-wiz: reconectar a sincronização do Lovable ao descricao_vagas (menu + → GitHub), pois a sync atual aponta para o vaga-wiz.
