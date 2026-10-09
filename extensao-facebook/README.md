# Extensão Achadinhos — assistente para Facebook

Primeira versão isolada da extensão (Manifest V3), criada porque o repositório atual contém apenas o site e os documentos legais, **não o código de qualquer extensão local anterior**. Não substitui nem altera a extensão que possa existir no computador do operador.

## Instalação manual de desenvolvimento
1. Baixar a branch deste pull request.
2. Abrir `chrome://extensions` (ou `edge://extensions`).
3. Ativar **Modo do desenvolvedor**.
4. Escolher **Carregar sem compactação** e selecionar a pasta `extensao-facebook`.
5. Fixar o ícone na barra e abrir.

## Fluxo
1. Selecionar nicho, cadastrar URL real de convite (ou a página `grupos.html`) e, opcionalmente, uma Página/Grupo Facebook com publicação permitida.
2. Salvar o destino, inserir produto, preço e contexto.
3. Clicar **Gerar texto** e revisar o rascunho.
4. **Copiar texto**, **Abrir Facebook** e publicar **manualmente**, respeitando as regras e permissões da comunidade.
5. Caso tenha publicado, usar **Marcar como publicado**. Exportar o histórico local em CSV quando necessário.

## Segurança e privacidade
- Permissão somente de armazenamento local (`storage`); nenhum acesso a cookies, sessão ou conteúdo dos sites.
- Não automatiza entrada em grupos, comentários, compartilhamentos ou publicação.
- Não possui servidor nem telemetria. URLs, rascunhos atuais (não persistidos) e registros manuais são armazenados no navegador; exportações são arquivos locais.
- A marcação de publicação é uma declaração do operador, não um status confirmado pela API da Meta.
- O link de convite deve ser genuíno e publicado com permissão. Não utilizar clones de domínios do Facebook.

## Limitações e próximos incrementos
- Integração com o motor de ofertas e importação automática de **rascunhos** ainda não implementadas.
- Não oferece agendamento de postagem nem coleta de dados dos grupos.
- Métricas de cliques e entradas precisam ser instrumentadas no site e/ou validadas pelos respectivos administradores.
- Não existem convites reais configurados no código: cadastrar URLs antes de usar o fluxo.
- Validar funcionamento no Chrome e Edge antes de qualquer distribuição.
