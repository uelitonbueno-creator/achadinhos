"use strict";

// Preencha APENAS convites reais dos grupos administrados pelo projeto.
// Os campos vazios deixam o botão oculto, evitando links falsos/expirados.
// Para receber pessoas por link, configure os controles de aprovação do WhatsApp/Telegram.
const GRUPOS_ACHADINHOS = [
  { id: "geral", nome: "Geral", descricao: "Oportunidades e promoções de várias categorias.", whatsapp: "", telegram: "" },
  { id: "mercado", nome: "Mercado", descricao: "Produtos do dia a dia, casa e supermercado.", whatsapp: "", telegram: "" },
  { id: "academia", nome: "Academia & Fitness", descricao: "Roupas, equipamentos e acessórios para treinar.", whatsapp: "", telegram: "" },
  { id: "moda", nome: "Moda", descricao: "Vestuário, calçados e acessórios em promoção.", whatsapp: "", telegram: "" },
  { id: "pescaria", nome: "Pescaria", descricao: "Equipamentos e acessórios para pesca.", whatsapp: "", telegram: "" },
  { id: "airsoft", nome: "Airsoft", descricao: "Vestuário, equipamentos de proteção e acessórios esportivos permitidos.", whatsapp: "", telegram: "" },
  { id: "geek", nome: "Geek", descricao: "Games, colecionáveis e tecnologia.", whatsapp: "", telegram: "" },
  { id: "shein-temu", nome: "SHEIN / Temu", descricao: "Moda e utilidades encontradas nessas lojas.", whatsapp: "", telegram: "" }
];

function validInvite(raw, channel) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    const hostname = url.hostname.toLowerCase();
    if (channel === "WhatsApp" && hostname !== "chat.whatsapp.com") return null;
    if (channel === "Telegram" && !["t.me", "telegram.me"].includes(hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function createInvite(label, href) {
  const a = document.createElement("a");
  a.className = "button" + (label === "Telegram" ? " secondary" : "");
  a.href = href;
  a.textContent = "Entrar no " + label;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.setAttribute("aria-label", "Abrir convite do " + label);
  return a;
}

function renderGroup(group) {
  const article = document.createElement("article");
  article.className = "group-tile";
  article.id = group.id;
  const title = document.createElement("h3");
  title.textContent = group.nome;
  const description = document.createElement("p");
  description.textContent = group.descricao;
  const links = document.createElement("div");
  links.className = "links";
  const wa = validInvite(group.whatsapp, "WhatsApp");
  const tg = validInvite(group.telegram, "Telegram");
  if (wa) links.append(createInvite("WhatsApp", wa));
  if (tg) links.append(createInvite("Telegram", tg));
  if (!wa && !tg) {
    const msg = document.createElement("p");
    msg.className = "invite-pending";
    msg.textContent = "Convite em configuração.";
    links.append(msg);
  }
  article.append(title, description, links);
  return article;
}

const root = document.getElementById("grupos");
if (root) GRUPOS_ACHADINHOS.forEach(group => root.append(renderGroup(group)));
