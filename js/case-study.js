/* =========================================================
   Function Psi — case-study reading progress
   ========================================================= */
(function () {
  "use strict";

  var progress = document.querySelector("[data-case-progress]");
  var article = document.querySelector("[data-case-article]");
  if (!progress || !article) return;

  var ticking = false;

  function update() {
    var rect = article.getBoundingClientRect();
    var viewport = window.innerHeight;
    var total = Math.max(1, rect.height - viewport * 0.55);
    var traveled = Math.min(total, Math.max(0, -rect.top + viewport * 0.22));
    var value = traveled / total;

    progress.style.transform = "scaleX(" + value + ")";
    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
})();
