(function () {
  var NUMBER = "5562998103265";
  var DEFAULT_MSG = "Olá! Vim pelo site e gostaria de um orçamento.";
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    var msg = el.getAttribute("data-msg") || DEFAULT_MSG;
    el.href = "https://wa.me/" + NUMBER + "?text=" + encodeURIComponent(msg);
    el.target = "_blank";
    el.rel = "noopener";
  });
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
