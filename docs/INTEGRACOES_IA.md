# Integrações ChatGPT para o Achadinhos
Atualização: 2026-10-09

## O que foi vinculado
Plugins conectados ao ambiente ChatGPT, **não instalados no site GitHub Pages nem no motor local**:
- **Firecrawl** — consulta web e extração estruturada em fontes públicas autorizadas;
- **GSC Wizard** — SEO e tráfego orgânico, quando o site tiver propriedade verificada/ativada no Search Console;
- **Consensus** — fora do fluxo padrão; eventual verificação de alegações científicas.

## Fluxo 1 — pesquisa responsável de produto
1. Escolher categoria e marketplace.
2. Verificar regras de acesso e optar por API de afiliados oficial quando existir.
3. Usar Firecrawl apenas para fontes públicas permitidas, com extração estritamente necessária e parcimoniosa.
4. Normalizar `nome, marketplace, url_oficial, preco_observado, moeda, cupom, estoque_observado, imagem_autorizada, coletado_em, fonte, termo_acesso`.
5. Conferir preço, disponibilidade, regras de afiliado e direitos de imagem imediatamente antes de qualquer postagem.
6. Encaminhar o resultado para o **motor real**, onde ele estiver hospedado, por uma interface validada. Este repositório não contém tal motor.

## Fluxo 2 — site público e SEO
1. Identificar o endereço de publicação em GitHub Pages e reivindicar/verificar a propriedade correspondente no Google Search Console.
2. Conectar e ativar a propriedade no GSC Wizard (na consulta de 09/10/2026 havia **zero propriedades**).
3. Medir semanalmente: indexação, consultas, impressões, cliques, CTR, páginas e tendências.
4. Formular ajustes rastreáveis por página em issue/PR. Não inferir conversão de afiliados a partir de cliques orgânicos.
5. Caso haja somente páginas institucionais, mensurar apenas estas — não confundir com o tráfego das publicações sociais.

## Métricas, privacidade e custo
- O plugin GSC Wizard pode ter restrições de acesso/plano; verificar antes de instituir automação recorrente.
- Evitar depender de assinaturas; o fluxo principal de vendas/postagens deve funcionar sem esses plugins.
- Tokens, dados pessoais e sessão de marketplace ficam fora de logs, HTML e GitHub público.
- Firecrawl não autoriza scraping indiscriminado, bypass de medidas anti-bot ou cópia de conteúdo protegido.

## Próximas conexões técnicas
Para integrar efetivamente a pesquisa ao motor de ofertas: localizar seu **repositório ou instalador de produção**; desenhar um adaptador autorizado, com validação do preço, tratamento de erros, rate limit, logs e feature flag; testar em sandbox. Nenhuma automação de mensagens ou redes sociais foi alterada aqui.
