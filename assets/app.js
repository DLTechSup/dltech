(function () {
  "use strict";
  window.__dltReady = true;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* menu do celular */
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("menu");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  /* entrada dos blocos ao rolar */
  var items = [].slice.call(document.querySelectorAll("[data-reveal]"));
  var groups = {};
  items.forEach(function (el) {
    var g = el.getAttribute("data-reveal") || "x";
    var p = el.parentElement;
    if (!p.__n) p.__n = 0;
    el.style.setProperty("--d", Math.min(p.__n, 5) * 80 + "ms");
    p.__n++;
  });
  var session = document.querySelector(".session");
  var stage = document.querySelector(".stage");
  var targets = items.concat(stage ? [stage] : []);

  function show(el) {
    if (el === stage) {
      session.classList.add("in");
      setTimeout(function () { session.classList.add("play"); }, 500);
      return;
    }
    el.classList.add("in");
  }

  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    if (session) session.classList.add("in", "play");
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          show(en.target);
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* barra de WhatsApp no celular: some enquanto o botão principal já está na tela */
  var bar = document.querySelector(".wa-bar");
  if (bar && "IntersectionObserver" in window) {
    var seen = new Set();
    var watch = [].slice.call(document.querySelectorAll("[data-hide-bar]"));
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target);
      });
      bar.classList.toggle("hide", seen.size > 0);
    }, { rootMargin: "0px 0px -90px 0px", threshold: 0 });
    watch.forEach(function (el) { io2.observe(el); });
  }

  /* formulário: monta a mensagem e atualiza o link do WhatsApp */
  var form = document.getElementById("form-contato");
  if (form) {
    var send = document.getElementById("enviar");
    var base = send.getAttribute("data-base");
    var nome = form.elements["nome"];
    var problema = form.elements["problema"];
    var update = function () {
      var n = nome.value.trim();
      var p = problema.value.trim().replace(/\s+/g, " ").replace(/[.!]+$/, "");
      var txt = "Olá! Vim pelo site da DLTech." + (n ? " Meu nome é " + n + "." : "");
      if (p) txt += "\n\nResumo: " + p + ".";
      else txt += " Preciso de ajuda com o meu computador.";
      send.href = base + "?text=" + encodeURIComponent(txt);
    };
    nome.addEventListener("input", update);
    problema.addEventListener("input", update);
    form.addEventListener("submit", function (e) { e.preventDefault(); update(); window.open(send.href, "_blank", "noopener"); });
    update();
  }
})();
