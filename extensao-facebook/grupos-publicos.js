"use strict";

(() => {
  const KEY = "achadinhosFacebookPublicGroupsV1";
  const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
  const MAX_GROUPS = 500;
  const MAX_HISTORY = 500;
  const $group = id => document.getElementById(id);
  const controlsGroup = {
    name: $group("grupoNome"),
    url: $group("grupoUrl"),
    access: $group("grupoAcesso"),
    allowed: $group("grupoDivulgacaoPermitida"),
    list: $group("listaGruposPublicos"),
    selected: $group("grupoSelecionado"),
    status: $group("statusGrupos"),
    summary: $group("resumoGrupos")
  };
  let data = { groups: [], history: [], selectedId: null };

  const invitations = [
    ["Geral 🛒", "https://chat.whatsapp.com/JzFRDDggoCNELY1LMzU3CY"],
    ["Tecnologia 📱💻", "https://chat.whatsapp.com/G2u7Pfs4Nt0EJvNzXdudst"],
    ["Moda 👗", "https://chat.whatsapp.com/KoLulyiar7i33ysPwj7c7a"],
    ["Casa & Cozinha 🏠", "https://chat.whatsapp.com/IlMOL9YARDC4Yn3zxW1qms"],
    ["Beleza 💄", "https://chat.whatsapp.com/F62Sf1jslBsKH7jo0Udl3L"],
    ["Esporte & Fitness 💪", "https://chat.whatsapp.com/L9AFLKHLQe09r6dC4QKoG2"],
    ["Automotivo 🚗", "https://chat.whatsapp.com/I4GAwAVH5Vp4IJkNUa9YHn"],
    ["Games & Geek 🎮", "https://chat.whatsapp.com/Lh9Zl1KML0n1rESVnl2RK4"],
    ["Pescaria 🎣", "https://chat.whatsapp.com/C8NrkhOzUda0Z7CjnLRL95"],
    ["Airsoft 🎯", "https://chat.whatsapp.com/IKOLdJ0JJy31Ko6KijoK6J"]
  ];

  const say = (message, isError = false) => {
    controlsGroup.status.textContent = message;
    controlsGroup.status.classList.toggle("error", isError);
  };

  const normalizedGroupUrl = raw => {
    try {
      const url = new URL(raw.trim());
      const host = url.hostname.toLowerCase();
      if (url.protocol !== "https:" || !["www.facebook.com", "facebook.com", "web.facebook.com", "m.facebook.com"].includes(host)) return null;
      const match = /^\/groups\/([^/?#]+)\/?$/.exec(url.pathname);
      if (!match || ["feed", "discover", "joins", "create"].includes(match[1].toLowerCase())) return null;
      return "https://www.facebook.com/groups/" + match[1];
    } catch {
      return null;
    }
  };

  const lastPost = id => data.history.find(item => item.groupId === id);
  const cooldownLeft = group => {
    const last = lastPost(group.id);
    return last ? Math.max(0, COOLDOWN_MS - (Date.now() - new Date(last.createdAt).getTime())) : 0;
  };
  const selectedGroup = () => data.groups.find(group => group.id === data.selectedId);
  const persist = () => chrome.storage.local.set({ [KEY]: data });
  const button = (label, handler, disabled = false) => {
    const node = document.createElement("button");
    node.type = "button";
    node.textContent = label;
    node.disabled = disabled;
    node.addEventListener("click", handler);
    return node;
  };

  function render() {
    controlsGroup.list.replaceChildren();
    const available = data.groups.filter(group => cooldownLeft(group) === 0).length;
    controlsGroup.summary.textContent = data.groups.length + " grupo(s) cadastrado(s); " + available + " elegível(is) pelo intervalo local de 7 dias.";
    const current = selectedGroup();
    controlsGroup.selected.textContent = current
      ? "Selecionado: " + current.name + " (" + (current.access === "visitante" ? "visitante" : "membro") + "). Confira as regras novamente no Facebook."
      : "Nenhum grupo selecionado.";
    if (!data.groups.length) {
      const p = document.createElement("p");
      p.className = "small";
      p.textContent = "Cadastre grupos em que as regras permitam ofertas ou convites. A extensão não descobre nem publica sozinha.";
      controlsGroup.list.append(p);
      return;
    }
    for (const group of data.groups) {
      const remaining = cooldownLeft(group);
      const article = document.createElement("div");
      article.className = "public-group";
      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = group.name;
      const description = document.createElement("p");
      description.className = "small";
      description.textContent = group.nicho + " · " + (group.access === "visitante" ? "Visitante" : "Membro")
        + (remaining ? " · Aguarde " + Math.ceil(remaining / 86400000) + " dia(s)" : " · Pronto para revisão");
      info.append(name, description);
      const actions = document.createElement("div");
      actions.className = "actions";
      actions.append(
        button("Preparar", () => prepare(group.id).catch(() => say("Não foi possível preparar o grupo.", true)), remaining > 0),
        button("Excluir", () => removeGroup(group.id).catch(() => say("Não foi possível excluir o grupo.", true)))
      );
      article.append(info, actions);
      controlsGroup.list.append(article);
    }
  }

  async function addGroup() {
    const name = controlsGroup.name.value.trim().replace(/\s+/g, " ").slice(0, 100);
    const url = normalizedGroupUrl(controlsGroup.url.value);
    if (!name) return say("Informe o nome do grupo.", true);
    if (!url) return say("Informe a URL HTTPS da página inicial de um grupo do Facebook.", true);
    if (!controlsGroup.allowed.checked) return say("Confirme que verificou as regras e que elas permitem a divulgação.", true);
    if (data.groups.some(item => item.url === url)) return say("Este grupo já está cadastrado.", true);
    if (data.groups.length >= MAX_GROUPS) return say("Limite de cadastros locais atingido.", true);
    data.groups.push({
      id: crypto.randomUUID(), name, url,
      niche: document.getElementById("nicho").value,
      access: controlsGroup.access.value,
      permissionConfirmedAt: new Date().toISOString()
    });
    await persist();
    controlsGroup.name.value = "";
    controlsGroup.url.value = "";
    controlsGroup.allowed.checked = false;
    render();
    say("Grupo salvo. Permissão declarada por você; a extensão não consegue verificá-la automaticamente.");
  }

  async function removeGroup(id) {
    const group = data.groups.find(item => item.id === id);
    if (!group || !window.confirm("Excluir o grupo " + group.name + " do cadastro local?")) return;
    data.groups = data.groups.filter(item => item.id !== id);
    if (data.selectedId === id) data.selectedId = null;
    await persist();
    render();
    say("Grupo excluído. O histórico de registros foi preservado.");
  }

  async function prepare(id) {
    const group = data.groups.find(item => item.id === id);
    if (!group) return say("Grupo não encontrado.", true);
    if (cooldownLeft(group)) return say("Este grupo está no intervalo de 7 dias desde o registro anterior.", true);
    data.selectedId = id;
    const nicheControl = document.getElementById("nicho");
    nicheControl.value = group.niche;
    nicheControl.dispatchEvent(new Event("change"));
    await persist();
    render();
    say("Destino preparado: revise o texto e abra o grupo. O envio é manual.");
  }

  async function prepareNext() {
    const available = data.groups.filter(group => cooldownLeft(group) === 0);
    if (!available.length) return say("Nenhum grupo elegível cadastrado. Confira os intervalos de divulgação.", true);
    const group = available.find(item => item.id !== data.selectedId) || available[0];
    await prepare(group.id);
  }

  function generalInvitation() {
    const lines = [
      "☀️ Boa tarde, pessoal! Tudo bem?",
      "",
      "🛍️ Vim convidar vocês para participar dos nossos grupos gratuitos de ofertas Achadinhos! 💙",
      "Compartilhamos promoções de lojas como Amazon, Shopee e Mercado Livre.",
      "",
      "📲 Escolha o grupo de sua preferência:",
      ""
    ];
    for (const [name, link] of invitations) lines.push("• " + name, link, "");
    lines.push("📸 Instagram: https://www.instagram.com/aqueleachadinhosma/", "",
      "🔥 Os preços e estoques podem mudar. Boas compras!");
    document.getElementById("texto").value = lines.join("\n");
    say("Modelo de convite carregado, com o grupo Geral em primeiro. Adapte-o às regras e ao tema da comunidade.");
  }

  async function openSelected() {
    const group = selectedGroup();
    if (!group) return say("Primeiro prepare um grupo cadastrado.", true);
    if (cooldownLeft(group)) return say("Intervalo local de divulgação ainda não concluído.", true);
    await chrome.tabs.create({ url: group.url, active: true });
    say("Grupo aberto. Confirme se você pode publicar como visitante ou membro; envie manualmente.");
  }

  async function markGroupPosted() {
    const group = selectedGroup();
    const content = document.getElementById("texto").value.trim();
    if (!group) return say("Selecione um grupo antes de registrar.", true);
    if (!content) return say("Prepare o texto da divulgação antes de registrar.", true);
    if (cooldownLeft(group)) return say("Já existe registro recente neste grupo. Evite duplicações.", true);
    if (!window.confirm("Você concluiu MANUALMENTE a publicação em " + group.name + "? Esta confirmação não consulta o Facebook.")) return;
    data.history.unshift({
      groupId: group.id, groupName: group.name, groupUrl: group.url,
      niche: group.niche, access: group.access,
      createdAt: new Date().toISOString(),
      text: content.slice(0, 4000), status: "informado_pelo_operador"
    });
    data.history = data.history.slice(0, MAX_HISTORY);
    await persist();
    render();
    say("Publicação anotada por declaração manual. O grupo ficará 7 dias fora da fila.");
  }

  function exportHistory() {
    if (!data.history.length) return say("Não há publicações em grupos registradas.", true);
    const safe = value => {
      const v = String(value ?? "");
      const protectedValue = /^[\s]*[=+@-]/.test(v) ? "'" + v : v;
      return '"' + protectedValue.replace(/"/g, '""') + '"';
    };
    const rows = [
      ["data_hora", "grupo", "url_grupo", "nicho", "acesso", "status", "mensagem"],
      ...data.history.map(row => [row.createdAt, row.groupName, row.groupUrl, row.niche, row.access, row.status, row.text])
    ];
    const blob = new Blob(["\uFEFF" + rows.map(row => row.map(safe).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "achadinhos-grupos-publicacoes.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say("Histórico CSV exportado.");
  }

  async function init() {
    try {
      const saved = (await chrome.storage.local.get(KEY))[KEY];
      if (saved && typeof saved === "object") {
        data.groups = Array.isArray(saved.groups) ? saved.groups.filter(g => g && typeof g.id === "string" && typeof g.url === "string") : [];
        data.history = Array.isArray(saved.history) ? saved.history : [];
        data.selectedId = typeof saved.selectedId === "string" ? saved.selectedId : null;
      }
      render();
    } catch {
      say("Falha ao ler grupos salvos neste navegador.", true);
    }
  }

  $group("salvarGrupo").addEventListener("click", () => addGroup().catch(() => say("Erro ao salvar grupo.", true)));
  $group("proximoGrupo").addEventListener("click", () => prepareNext().catch(() => say("Erro ao preparar próximo destino.", true)));
  $group("conviteGeral").addEventListener("click", generalInvitation);
  $group("abrirGrupo").addEventListener("click", () => openSelected().catch(() => say("Erro ao abrir grupo.", true)));
  $group("marcarGrupo").addEventListener("click", () => markGroupPosted().catch(() => say("Erro ao registrar publicação.", true)));
  $group("csvGrupos").addEventListener("click", exportHistory);
  init();
})();
