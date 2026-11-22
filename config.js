/* =========================================================
   CONFIGURAÇÃO DO SITE — MASTER SOUD
   Edite só este arquivo para trocar número, pixel e textos.
   ========================================================= */
window.SITE_CONFIG = {
  // WhatsApp com DDI + DDD, só números
  whatsapp: "5562998103265",
  whatsappDefaultMsg: "Olá! Vim pelo site da Master Soud e quero um orçamento.",

  // ---------------- META PIXEL ----------------
  // 1. No Gerenciador de Eventos da Meta, crie/abra seu Pixel (Conjunto de dados).
  // 2. Copie o ID (só números) e cole entre as aspas abaixo.
  // 3. Envie este arquivo para o GitHub e publique no Render.
  // Eventos já configurados: PageView, ViewContent (serviços),
  // Contact (qualquer clique no WhatsApp) e Lead (orçamento pelo chat).
  metaPixelId: "1704537661280460",

  // ---------------- GOOGLE ANALYTICS 4 ----------------
  // Propriedade "Site mastersoundofc.com.br" (conta soudmasteradm@gmail.com).
  // O ID também está no <head> das páginas (index.html e residencial.html).
  gaId: "G-6LS2Y4Z3Y0",
  // Eventos enviados ao GA4: generate_lead (clique no WhatsApp e pedido pelo chat),
  // chat_open, chat_quote_start, view_services.

  // Pede consentimento de cookies (LGPD) antes de ativar cookies de análise e anúncios.
  // Sem consentimento o GA4 só recebe sinais sem cookies (Consent Mode v2).
  requireConsent: true,

  instagram: "https://www.instagram.com/master_soudd",
  youtube: "https://www.youtube.com/@master_soudd",
  facebook: "https://www.facebook.com/profile.php?id=61596986270230",
  tiktok: "https://www.tiktok.com/@master_soudd",
  endereco: "Rua Jamunda com Itu, Vila Brasília — Aparecida de Goiânia/GO, 74905-430"
};
