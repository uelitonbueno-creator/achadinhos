# Roteiro de validação — ainda não executado em navegador

Antes do merge, testar manualmente no Chrome e no Edge.

- [ ] Carregar `extensao-facebook/` em modo desenvolvedor sem erros de manifesto ou console.
- [ ] Escolher os 8 nichos e confirmar que URLs ficam isoladas por nicho.
- [ ] Gravar destino, fechar/abrir popup e verificar persistência.
- [ ] Rejeitar link inválido e destino Facebook fora de `facebook.com`.
- [ ] Gerar publicação com produto, preço De/Por e convite real; revisar texto e parâmetros UTM.
- [ ] Gerar publicação com convite direto WhatsApp/Telegram e confirmar que o link não foi alterado.
- [ ] Copiar texto e colar em campo de teste (não publicar durante QA).
- [ ] Abrir Facebook e confirmar que a extensão não tenta publicar nem extrair dados.
- [ ] Registrar manualmente publicação, exportar CSV, testar abertura em planilha e apagar histórico.
- [ ] Verificar `grupos.html` em desktop e celular.
- [ ] Confirmar que os botões sem link mostram apenas "Convite em configuração".
- [ ] Configurar links verdadeiros em `grupos.js` e validar aprovação/entrada com voluntário.
- [ ] Verificar privacidade, termos, acessibilidade por teclado e evitar links quebrados.
- [ ] Confirmar que o site anterior e as páginas legais continuam funcionando.

**Importante:** código disponível na branch não equivale a extensão instalada ou postagem funcionando em produção.
