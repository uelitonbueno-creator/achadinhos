"use strict";

const STORAGE_KEY = "achadinhosFacebookV1";
const MAX_HISTORY = 100;
const $ = id => document.getElementById(id);
let state = { destinos: {}, historico: [] };

const controls = {
  nicho: $("nicho"), convite: $("convite"), facebook: $("facebook"),
  produto: $("produto"), antes: $("antes"), agora: $("agora"),
  observacao: $("observacao"), texto: $("texto"), status: $("status"),
  historico: $("historico")
};

function setStatus(message, error = false) {
  controls.status.textContent = message;
  controls.status.classList.toggle("error", error);
}

function parseWebUrl(raw) {
  try {
    const url = new URL(raw.trim());
    return ["http:", "https:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function facebookUrl(raw) {
  const url = parseWebUrl(raw);
  if (!url || url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  return host === "facebook.com" || host.endsWith(".facebook.com") ? url : null;
}

function getNicho() {
  return controls.nicho.value;
}

function loadDestino() {
  const destino = state.destinos[getNicho()] || {};
  controls.convite.value = destino.convite || "";
  controls.facebook.value = destino.facebook || "";
  setStatus("");
}

async function persist() {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

async function saveDestino() {
  const convite = controls.convite.value.trim();
  const facebook = controls.facebook.value.trim();
  if (convite && !parseWebUrl(convite)) {
    setStatus("Informe um link válido começando por http(s).", true);
    return false;
  }
  if (facebook && !facebookUrl(facebook)) {
    setStatus("O destino Facebook deve ser um endereço HTTPS do facebook.com.", true);
    return false;
  }
  state.destinos[getNicho()] = { convite, facebook };
  await persist();
  setStatus("Destino salvo neste navegador.");
  return true;
}

function cleanPrice(text) {
  const value = text.trim().replace(/^R\$\s*/i, "");
  return /^\d[\d.,]*$/.test(value) ? value : null;
}

function linkWithAttribution(raw, niche) {
  const url = parseWebUrl(raw);
  if (!url) return null;
  // Parâmetros de campanha apenas em páginas web; não alterar convites do mensageiro.
  if (!["chat.whatsapp.com", "wa.me", "t.me", "telegram.me"].includes(url.hostname.toLowerCase())) {
    url.searchParams.set("utm_source", "facebook");
    url.searchParams.set("utm_medium", "organic");
    url.searchParams.set("utm_campaign", "achadinhos_grupos");
    url.searchParams.set("utm_content", niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_"));
  }
  return url.toString();
}

function generateText() {
  const name = controls.produto.value.trim().replace(/\s+/g, " ");
  const link = linkWithAttribution(controls.convite.value.trim(), getNicho());
  if (!name) return setStatus("Preencha o nome do produto ou tema.", true);
  if (!link) return setStatus("Cadastre primeiro o link do grupo ou página de grupos.", true);
  const before = controls.antes.value.trim() ? cleanPrice(controls.antes.value) : null;
  const after = controls.agora.value.trim() ? cleanPrice(controls.agora.value) : null;
  if ((controls.antes.value.trim() && !before) || (controls.agora.value.trim() && !after)) {
    return setStatus("Preencha os preços somente com números e separadores.", true);
  }
  const lines = [
    "🔥 Achadinho para " + getNicho(),
    "",
    "✅ " + name
  ];
  if (before && after) lines.push("💰 De R$ " + before + " Por R$ " + after);
  else if (after) lines.push("💰 Por R$ " + after);
  const description = controls.observacao.value.trim().replace(/\s+/g, " ");
  if (description) lines.push("✨ " + description);
  lines.push("", "📲 Receba ofertas desse nicho no nosso grupo:", link, "", "Preços, cupons e estoque podem mudar.");
  controls.texto.value = lines.join("\n");
  setStatus("Rascunho gerado. Revise antes de postar.");
}

async function copyText() {
  const value = controls.texto.value.trim();
  if (!value) return setStatus("Gere ou escreva um rascunho antes de copiar.", true);
  try {
    await navigator.clipboard.writeText(value);
    setStatus("Texto copiado para a área de transferência.");
  } catch {
    controls.texto.focus();
    controls.texto.select();
    const success = document.execCommand("copy");
    setStatus(success ? "Texto copiado." : "Copie manualmente o texto selecionado.", !success);
  }
}

async function openFacebook() {
  const raw = controls.facebook.value.trim();
  const target = raw ? facebookUrl(raw) : new URL("https://www.facebook.com/");
  if (!target) return setStatus("Destino Facebook inválido. Verifique o link.", true);
  await chrome.tabs.create({ url: target.toString(), active: true });
  setStatus("Facebook aberto. Publique manualmente após revisão.");
}

function safeCsvCell(value) {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function renderHistory() {
  controls.historico.replaceChildren();
  if (!state.historico.length) {
    const li = document.createElement("li");
    li.textContent = "Nenhuma publicação registrada.";
    controls.historico.append(li);
    return;
  }
  for (const item of state.historico.slice(0, 8)) {
    const li = document.createElement("li");
    li.textContent = new Date(item.createdAt).toLocaleString("pt-BR") + " · " + item.nicho + " · " + item.produto;
    controls.historico.append(li);
  }
}

async function markPublished() {
  if (!controls.texto.value.trim()) return setStatus("Preencha o rascunho primeiro.", true);
  if (!window.confirm("Você publicou manualmente no Facebook e quer registrar essa ação?")) return;
  state.historico.unshift({
    createdAt: new Date().toISOString(),
    nicho: getNicho(),
    produto: controls.produto.value.trim().slice(0, 140),
    facebook: controls.facebook.value.trim(),
    texto: controls.texto.value.slice(0, 2000),
    status: "informado_pelo_operador"
  });
  state.historico = state.historico.slice(0, MAX_HISTORY);
  await persist();
  renderHistory();
  setStatus("Publicação registrada conforme declaração do operador.");
}

function exportCsv() {
  if (!state.historico.length) return setStatus("Não há registros para exportar.", true);
  const rows = [["data_hora", "nicho", "produto", "destino_facebook", "status", "texto"], ...state.historico.map(item =>
    [item.createdAt, item.nicho, item.produto, item.facebook, item.status, item.texto]
  )];
  const body = "\uFEFF" + rows.map(row => row.map(safeCsvCell).join(";")).join("\r\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "achadinhos-facebook-historico.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus("CSV exportado.");
}

async function clearHistory() {
  if (!state.historico.length) return;
  if (!window.confirm("Excluir todo o histórico local de publicações?")) return;
  state.historico = [];
  await persist();
  renderHistory();
  setStatus("Histórico local apagado.");
}

async function initialize() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored && typeof stored === "object") {
      state.destinos = stored.destinos && typeof stored.destinos === "object" ? stored.destinos : {};
      state.historico = Array.isArray(stored.historico) ? stored.historico : [];
    }
    loadDestino();
    renderHistory();
  } catch (e) {
    setStatus("Não foi possível ler o armazenamento local.", true);
  }
}

controls.nicho.addEventListener("change", loadDestino);
$("salvarDestino").addEventListener("click", () => saveDestino().catch(() => setStatus("Erro ao salvar destino.", true)));
$("gerar").addEventListener("click", generateText);
$("copiar").addEventListener("click", () => copyText().catch(() => setStatus("Erro ao copiar.", true)));
$("abrir").addEventListener("click", () => openFacebook().catch(() => setStatus("Erro ao abrir Facebook.", true)));
$("publicado").addEventListener("click", () => markPublished().catch(() => setStatus("Erro ao registrar publicação.", true)));
$("csv").addEventListener("click", exportCsv);
$("limpar").addEventListener("click", () => clearHistory().catch(() => setStatus("Erro ao limpar histórico.", true)));
initialize();
