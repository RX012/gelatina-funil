(function () {
  try {
    if (window.__GLOBAL_FOOTER_INJECTED__) return;
    window.__GLOBAL_FOOTER_INJECTED__ = true;
    if (window.DISABLE_GLOBAL_FOOTER) return;
    var FOOTER_URL = "footer.html";
    function injectFooter(html) {
      if (document.querySelector('footer[data-global-footer="1"]')) return;
      var wrapper = document.createElement("div");
      wrapper.innerHTML = (html || "").trim();
      var footer = wrapper.querySelector("footer") || wrapper.firstElementChild;
      if (footer) footer.setAttribute("data-global-footer", "1");
      document.body.appendChild(wrapper);
    }
    function run() {
      fetch(FOOTER_URL, { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("404");
          return r.text();
        })
        .then(injectFooter)
        .catch(function () {});
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  } catch (e) {}
})();
try {
  // se jÃ¡ foi configurado em algum outro script, nÃ£o registra de novo
  if (!window.__BK_REDIRECT_CONFIGURED) {
    window.__BK_REDIRECT_CONFIGURED = true;

    // se alguma pÃ¡gina quiser desativar, sÃ³ definir isso antes:
    // window.BK_DISABLE_REDIRECT = true;
    if (!window.BK_DISABLE_REDIRECT) {
      (function () {
        var path = (window.location.pathname || '').toLowerCase();

        // nÃ£o ativa nas prÃ³prias pÃ¡ginas de backredirect
        if (path.indexOf('bk_padrao.html') !== -1 || path.indexOf('bk_padrao_espanhol.html') !== -1) {
          return;
        }

        // base pode ser sobrescrita em alguma pÃ¡gina especÃ­fica:
        // window.BK_REDIRECT_DESTINO = 'outra_pagina.html';
        var DESTINO_BASE = window.BK_REDIRECT_DESTINO || 'bk_padrao_espanhol.html';

        // copia todos os parÃ¢metros da URL atual (?utm_..., sck, fbclidâ€¦)
        var urlAtual = new URL(window.location.href);
        var query = urlAtual.search || ''; // jÃ¡ vem com "?" se existir

        var destinoFinal = DESTINO_BASE + query;

        // empurra um estado pro histÃ³rico pra interceptar o â€œvoltarâ€
        window.history.pushState({ bk_redirect: true }, '', window.location.href);

        var jaRedirecionou = false;

        window.addEventListener('popstate', function () {
          // se jÃ¡ redirecionou uma vez, nÃ£o faz de novo
          if (jaRedirecionou) return;

          // intercepta o "voltar" independentemente do state de destino
          jaRedirecionou = true;
          window.location.replace(destinoFinal);
        });
      })();
    }
  }
} catch (e) {
  console.warn('Erro backredirect:', e);
}

try {
  (function () {
    // 1) Pega o caminho atual e o nome do arquivo
    var path = (window.location.pathname || '');
    var arquivo = path.split('/').pop();   // ex: "pagina17.html"
    if (!arquivo) return;

    var arquivoLower = arquivo.toLowerCase();

    // 2) SÃ³ seguimos se bater com o padrÃ£o "paginaX.html"
    var match = arquivoLower.match(/^pagina(\d+(?:-\d+)?)\.html$/);
    if (!match) {
      // nÃ£o Ã© uma pÃ¡gina do funil no formato esperado
      return;
    }

    // 3) NÃºmero da pÃ¡gina atual (X em paginaX.html)
    var numAtual = parseInt(String(match[1]).split('-')[0], 10);
    if (isNaN(numAtual)) return;

    // 4) Chaves do localStorage
    var LS_KEY_NUM  = 'salrosa_ultima_pagina_num';
    var LS_KEY_NOME = 'salrosa_ultima_pagina';

    // 5) Salva SEMPRE a pÃ¡gina atual.
    // Isso garante que o back redirect retome exatamente de onde a pessoa saiu,
    // e nÃ£o da pÃ¡gina mais alta que ela jÃ¡ visitou em algum momento anterior.
    try {
      localStorage.setItem(LS_KEY_NUM, String(numAtual));
      localStorage.setItem(LS_KEY_NOME, arquivoLower); // ex: "pagina17.html"
    } catch (e) {
      console.warn('NÃ£o foi possÃ­vel salvar ultima pÃ¡gina no localStorage:', e);
    }
  })();
} catch (e) {
  console.warn('Erro ao processar ultima pÃ¡gina do funil:', e);
}

        try {
        (function () {

            // Ranges de altura
            const RANGE_CM = { min: 140, max: 240 };
            const RANGE_IN = { min: 55, max: 103 }; // 4'7" â†’ 7'9"

            const STEP = 1;
            const MAJOR_EVERY = 5;

            const INITIAL_CM = 165;

            const wrapper = document.getElementById('heightRulerWrapper');
            const ruler = document.getElementById('heightRuler');
            const bigVal = document.getElementById('heightBigValue');
            const label = document.getElementById('heightUnitLabel');
            const toggle = document.querySelectorAll('#heightToggle button');
            const pointer = document.querySelector('.height-picker .pointer');

            if (!wrapper || !ruler || !bigVal || !label || !pointer) {
                return;
            }

            let unit = "cm";
            let currentMin = RANGE_CM.min;
            let currentMax = RANGE_CM.max;
            let currentValue = INITIAL_CM;
            let ticks = [];

            // Helpers
            function cmToIn(cm) { return cm / 2.54; }
            function inToCm(i) { return i * 2.54; }

            function clamp(v, min, max) {
                return Math.min(max, Math.max(min, v));
            }

            function getMaxScroll() {
                return wrapper.scrollWidth - wrapper.clientWidth;
            }

            function getPointerCenterX() {
                const rect = pointer.getBoundingClientRect();
                return rect.left + rect.width / 2;
            }

            function updateRulerPadding() {
                if (!ticks.length) return;
                const firstRect = ticks[0].getBoundingClientRect();
                const tickWidth = firstRect.width || 15;
                const wrapperWidth = wrapper.clientWidth;
                const pad = Math.max(wrapperWidth / 2 - tickWidth / 2, 0);
                ruler.style.paddingLeft = pad + 'px';
                ruler.style.paddingRight = pad + 'px';
            }

            // ExibiÃ§Ã£o
            function convertInToFeetInches(i) {
                const feet = Math.floor(i / 12);
                const inches = Math.round(i % 12);
                return `${feet}'${inches}"`;
            }

            function updateDisplay() {
                if (unit === "cm") {
                    bigVal.textContent = Math.round(currentValue);
                    label.textContent = "cm";
                } else {
                    bigVal.textContent = convertInToFeetInches(currentValue);
                    label.textContent = "";  // mostra a unidade quando estiver em pÃ©s/polegadas
                }
            }

            // Montar rÃ©gua
            function build() {
                ruler.innerHTML = "";
                for (let v = currentMin; v <= currentMax; v += STEP) {
                    const tick = document.createElement("div");
                    tick.classList.add("tick");

                    const line = document.createElement("div");
                    line.classList.add("tick-line");

                    if (v % MAJOR_EVERY === 0) {
                        tick.classList.add("tick--big");

                        const lbl = document.createElement("div");
                        lbl.classList.add("tick-label");

                        // â— aqui Ã© onde mudamos o texto do rÃ³tulo conforme a unidade
                        if (unit === "cm") {
                            lbl.textContent = v;                       // 140, 145, 150, ...
                        } else {
                            lbl.textContent = convertInToFeetInches(v); // 4'7", 5'0", 5'5", ...
                        }

                        tick.appendChild(line);
                        tick.appendChild(lbl);
                    } else {
                        tick.classList.add("tick--small");
                        tick.appendChild(line);
                    }

                    ruler.appendChild(tick);
                }

                ticks = Array.from(ruler.querySelectorAll(".tick"));
                updateRulerPadding();
            }

            // Descobrir tick embaixo do ponteiro
            function getNearestValueByPointer() {
                if (!ticks.length) return currentMin;
                const pointerX = getPointerCenterX();
                let idx = 0;
                let minDist = Infinity;

                ticks.forEach((t, i) => {
                    const r = t.getBoundingClientRect();
                    const center = r.left + r.width / 2;
                    const dist = Math.abs(center - pointerX);
                    if (dist < minDist) {
                        minDist = dist;
                        idx = i;
                    }
                });

                return currentMin + idx;
            }

            // Centralizar um valor
            function scrollToValue(v, smooth = true) {
                if (!ticks.length) return;

                v = clamp(Math.round(v), currentMin, currentMax);
                const idx = v - currentMin;
                const tick = ticks[idx];
                if (!tick) return;

                const pointerX = getPointerCenterX();
                const rect = tick.getBoundingClientRect();
                const tickCenter = rect.left + rect.width / 2;
                const delta = tickCenter - pointerX;

                const maxScroll = getMaxScroll();
                let target = wrapper.scrollLeft + delta;
                target = clamp(target, 0, maxScroll);

                wrapper.scrollTo({
                    left: target,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }

            // Scroll atualiza valor
            wrapper.addEventListener("scroll", () => {
                currentValue = getNearestValueByPointer();
                updateDisplay();
            });

            // Toggle unidade
            toggle.forEach(btn => {
                btn.addEventListener("click", () => {
                    const newUnit = btn.dataset.unit;
                    if (newUnit === unit) return;

                    let base = currentValue;

                    if (unit === "cm" && newUnit === "in") {
                        base = cmToIn(currentValue);
                    } else if (unit === "in" && newUnit === "cm") {
                        base = inToCm(currentValue);
                    }

                    unit = newUnit;

                    toggle.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");

                    if (unit === "cm") {
                        currentMin = RANGE_CM.min;
                        currentMax = RANGE_CM.max;
                        currentValue = clamp(Math.round(base), RANGE_CM.min, RANGE_CM.max);
                    } else {
                        currentMin = RANGE_IN.min;
                        currentMax = RANGE_IN.max;
                        currentValue = clamp(Math.round(base), RANGE_IN.min, RANGE_IN.max);
                    }

                    build();
                    updateDisplay();
                    scrollToValue(currentValue, true);
                });
            });

            // InicializaÃ§Ã£o
            build();
            updateDisplay();

            window.addEventListener('load', () => {
                setTimeout(() => {
                    scrollToValue(currentValue, false);
                }, 50);
            });

            window.addEventListener('resize', () => {
                setTimeout(() => {
                    updateRulerPadding();
                    scrollToValue(currentValue, false);
                }, 0);
            });

        })();
        } catch (e) {
    console.warn("Erro 1:", e);
    }
try {
        (function () {
            // ðŸ”¢ RANGES POR UNIDADE
            const RANGE_KG = { min: 40, max: 270 };
            const RANGE_LB = { min: 90, max: 550 };

            const STEP = 1;
            const MAJOR_EVERY = 10;
            const MEDIUM_EVERY = 5;
            const INITIAL_VALUE = 70; // comeÃ§a em 70 kg

            const rulerWrapper = document.getElementById('rulerWrapper');
            const ruler = document.getElementById('ruler');
            const bigValueEl = document.getElementById('bigValue');
            const unitLabelEl = document.getElementById('unitLabel');
            const unitButtons = document.querySelectorAll('.peso-wrapper .unit-toggle button');
            const heightUnitButtons = document.querySelectorAll('.height-picker .unit-toggle button');

            const pointerSvg = document.querySelector('.pointer');

            if (!rulerWrapper || !ruler || !bigValueEl || !unitLabelEl || !pointerSvg) {
                return;
            }

            let currentUnit = 'kg';
            let currentMin = RANGE_KG.min;
            let currentMax = RANGE_KG.max;
            let currentValue = INITIAL_VALUE;
            let tickElements = [];



            // ðŸ”” AnimaÃ§Ã£o suave ao abrir (balanÃ§o esquerdo/direito)
            let hintDone = false;

            // AnimaÃ§Ã£o suave de scroll com easing
            function animateScrollTo(target, duration, callback) {
                const start = rulerWrapper.scrollLeft;
                const distance = target - start;
                const startTime = performance.now();

                function step(now) {
                    const elapsed = now - startTime;
                    const t = Math.min(elapsed / duration, 1); // 0 â†’ 1

                    // easing suave (ease-out)
                    const eased = t * (2 - t);

                    rulerWrapper.scrollLeft = start + distance * eased;

                    if (t < 1) {
                        requestAnimationFrame(step);
                    } else if (typeof callback === "function") {
                        callback();
                    }
                }

                requestAnimationFrame(step);
            }

            // â€œbalancinhoâ€ suave ao abrir
            function startHintScroll() {
                if (hintDone) return;
                hintDone = true;

                const original = rulerWrapper.scrollLeft;
                const maxScroll = getMaxScroll();

                // movimento pequeno pra nÃ£o ficar agressivo
                const delta = Math.min(25, maxScroll); // 25px pra cada lado

                if (delta <= 0) return;

                // 1) Vai um pouco pra direita
                animateScrollTo(original + delta, 380, () => {
                    // 2) Depois um pouco pra esquerda
                    animateScrollTo(Math.max(0, original - delta), 420, () => {
                        // 3) E volta pro centro
                        animateScrollTo(original, 400);
                    });
                });
            }
            /* --------- Montar ticks na rÃ©gua conforme unidade atual --------- */
            function buildTicks() {
                for (let v = currentMin; v <= currentMax; v += STEP) {
                    const tick = document.createElement('div');
                    tick.classList.add('tick');

                    const line = document.createElement('div');
                    line.classList.add('tick-line');

                    if (v % MAJOR_EVERY === 0) {
                        tick.classList.add('tick--big');
                        const label = document.createElement('div');
                        label.classList.add('tick-label');
                        label.textContent = v;
                        tick.appendChild(line);
                        tick.appendChild(label);
                    } else if (v % MEDIUM_EVERY === 0) {
                        tick.classList.add('tick--medium');
                        tick.appendChild(line);
                    } else {
                        tick.classList.add('tick--small');
                        tick.appendChild(line);
                    }

                    ruler.appendChild(tick);
                }
            }

            /* --------- Helpers --------- */
            function kgToLb(kg) {
                return kg * 2.20462;
            }
            function lbToKg(lb) {
                return lb / 2.20462;
            }
            function clamp(value, min, max) {
                return Math.min(max, Math.max(min, value));
            }
            function formatValue() {
                return Math.round(currentValue).toString();
            }
            function refreshDisplayedValue() {
                bigValueEl.textContent = formatValue();
                unitLabelEl.textContent = currentUnit;
            }
            function getMaxScroll() {
                return rulerWrapper.scrollWidth - rulerWrapper.clientWidth;
            }
            function getPointerCenterX() {
                const rect = pointerSvg.getBoundingClientRect();
                return rect.left + rect.width / 2;
            }

            /* Padding lateral pra centralizar min/max */
            function updateRulerPadding() {
                if (!tickElements.length) return;
                const firstRect = tickElements[0].getBoundingClientRect();
                const tickWidth = firstRect.width || 15;
                const wrapperWidth = rulerWrapper.clientWidth;
                const pad = Math.max(wrapperWidth / 2 - tickWidth / 2, 0);
                ruler.style.paddingLeft = pad + 'px';
                ruler.style.paddingRight = pad + 'px';
            }

            /* Descobrir qual tick estÃ¡ embaixo do ponteiro */
            function getNearestIndexByPointer() {
                if (!tickElements.length) return 0;
                const pointerX = getPointerCenterX();
                let closestIndex = 0;
                let minDist = Infinity;
                for (let i = 0; i < tickElements.length; i++) {
                    const rect = tickElements[i].getBoundingClientRect();
                    const center = rect.left + rect.width / 2;
                    const dist = Math.abs(center - pointerX);
                    if (dist < minDist) {
                        minDist = dist;
                        closestIndex = i;
                    }
                }
                return closestIndex;
            }

            /* Atualizar valor com base no scroll */
            function updateFromScroll() {
                if (!tickElements.length) return;
                const index = getNearestIndexByPointer();
                currentValue = currentMin + index;
                refreshDisplayedValue();
            }

            /* Centralizar um valor especÃ­fico */
            function scrollToValue(value, smooth) {
                if (!tickElements.length) return;
                value = clamp(Math.round(value), currentMin, currentMax);
                const index = value - currentMin;
                const tick = tickElements[index];
                if (!tick) return;

                const pointerX = getPointerCenterX();
                const rect = tick.getBoundingClientRect();
                const tickCenter = rect.left + rect.width / 2;
                const delta = tickCenter - pointerX;

                const maxScroll = getMaxScroll();
                let targetScroll = rulerWrapper.scrollLeft + delta;
                targetScroll = clamp(targetScroll, 0, maxScroll);

                rulerWrapper.scrollTo({
                    left: targetScroll,
                    behavior: smooth ? 'smooth' : 'auto'
                });
            }

            function snapToNearest(smooth) {
                if (!tickElements.length) return;
                const index = getNearestIndexByPointer();
                const value = currentMin + index;
                scrollToValue(value, smooth);
            }

            /* Scroll com rAF */
            let ticking = false;
            rulerWrapper.addEventListener('scroll', function () {
                if (!ticking) {
                    window.requestAnimationFrame(function () {
                        updateFromScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            /* Drag + inÃ©rcia */
            let isDragging = false;
            let dragStartX = 0;
            let startScrollLeft = 0;

            let inertiaRAF = null;
            let inertiaVelocity = 0;
            let lastFrameTime = 0;
            let lastScrollLeft = 0;
            const FRICTION = 0.95;
            const MIN_VELOCITY = 0.02;

            function stopInertia() {
                if (inertiaRAF !== null) {
                    cancelAnimationFrame(inertiaRAF);
                    inertiaRAF = null;
                }
                inertiaVelocity = 0;
            }

            rulerWrapper.addEventListener('mousedown', function (e) {
                e.preventDefault();
                isDragging = true;
                rulerWrapper.classList.add('dragging');
                dragStartX = e.pageX;
                startScrollLeft = rulerWrapper.scrollLeft;
                lastScrollLeft = startScrollLeft;
                lastFrameTime = performance.now();
                stopInertia();
                const sel = window.getSelection && window.getSelection();
                if (sel && sel.removeAllRanges) sel.removeAllRanges();
            });

            window.addEventListener('mouseup', function () {
                if (!isDragging) return;
                isDragging = false;
                rulerWrapper.classList.remove('dragging');
                if (Math.abs(inertiaVelocity) > MIN_VELOCITY) {
                    startInertia();
                } else {
                    snapToNearest(true);
                }
            });

            window.addEventListener('mousemove', function (e) {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX;
                const walk = dragStartX - x;
                const maxScroll = getMaxScroll();
                let newScrollLeft = startScrollLeft + walk;
                newScrollLeft = clamp(newScrollLeft, 0, maxScroll);

                const now = performance.now();
                const dt = now - lastFrameTime || 16;

                inertiaVelocity = (newScrollLeft - lastScrollLeft) / dt;

                rulerWrapper.scrollLeft = newScrollLeft;
                lastScrollLeft = newScrollLeft;
                lastFrameTime = now;

                updateFromScroll();
            });

            function startInertia() {
                lastFrameTime = performance.now();
                function step() {
                    const now = performance.now();
                    const dt = now - lastFrameTime || 16;
                    lastFrameTime = now;

                    const maxScroll = getMaxScroll();
                    let newScroll = rulerWrapper.scrollLeft + inertiaVelocity * dt;

                    if (newScroll < 0) {
                        newScroll = 0;
                        inertiaVelocity = 0;
                    } else if (newScroll > maxScroll) {
                        newScroll = maxScroll;
                        inertiaVelocity = 0;
                    }

                    rulerWrapper.scrollLeft = newScroll;
                    updateFromScroll();

                    inertiaVelocity *= FRICTION;

                    if (Math.abs(inertiaVelocity) < MIN_VELOCITY) {
                        inertiaVelocity = 0;
                        inertiaRAF = null;
                        snapToNearest(true);
                        return;
                    }

                    inertiaRAF = requestAnimationFrame(step);
                }
                inertiaRAF = requestAnimationFrame(step);
            }

            /* Toggle kg / lb com ranges diferentes */
            unitButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const newUnit = btn.getAttribute('data-unit');
                    if (newUnit === currentUnit) return;

                    stopInertia();

                    const oldUnit = currentUnit;
                    const oldValue = currentValue;
                    let converted = oldValue;

                    if (oldUnit === 'kg' && newUnit === 'lb') {
                        converted = kgToLb(oldValue);
                    } else if (oldUnit === 'lb' && newUnit === 'kg') {
                        converted = lbToKg(oldValue);
                    }

                    currentUnit = newUnit;

                    // aplica range por unidade
                    if (newUnit === 'kg') {
                        currentMin = RANGE_KG.min;
                        currentMax = RANGE_KG.max;
                    } else {
                        currentMin = RANGE_LB.min;
                        currentMax = RANGE_LB.max;
                    }

                    // limita dentro do novo range
                    currentValue = clamp(Math.round(converted), currentMin, currentMax);

                    // estado visual do toggle
                    unitButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // reconstruir rÃ©gua no novo range
                    ruler.innerHTML = "";
                    buildTicks();
                    tickElements = Array.from(ruler.querySelectorAll('.tick'));
                    updateRulerPadding();

                    refreshDisplayedValue();
                    scrollToValue(currentValue, true);
                });
            });

            /* InicializaÃ§Ã£o */
            buildTicks();
            tickElements = Array.from(ruler.querySelectorAll('.tick'));

            window.addEventListener('load', () => {
                currentUnit = 'kg';
                currentMin = RANGE_KG.min;
                currentMax = RANGE_KG.max;
                currentValue = INITIAL_VALUE;
                refreshDisplayedValue();

                setTimeout(() => {
                    updateRulerPadding();
                    scrollToValue(INITIAL_VALUE, false);
                    updateFromScroll();

                    // ðŸ‘‡ depois de centralizar, faz o "balancinho" uma vez
                    setTimeout(() => {
                        startHintScroll();
                    }, 300);
                }, 0);
            });
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    updateRulerPadding();
                    scrollToValue(currentValue, false);
                }, 0);
            });
        })();
        } catch (e) {
            console.warn("Erro 2:", e);
        }
try {
document.addEventListener("DOMContentLoaded", () => {

/* ===============================
   ANIMAÃ‡ÃƒO DA BARRA DE PROGRESSO (SUAVE, 2s)
   =============================== */
const bar = document.querySelector(".progress-bar-fill");
const wrapper = document.querySelector(".progress-wrapper");

if (bar && wrapper) {
    const styles = getComputedStyle(wrapper);

    // LÃª variÃ¡veis CSS: ex. "96%" e "100%" â†’ 96 e 100
    const START_PCT = parseFloat(
        styles.getPropertyValue("--progreso-inicio") || "0"
    );
    const END_PCT = parseFloat(
        styles.getPropertyValue("--progreso-final") || "100"
    );

    // estado inicial: comeÃ§a exatamente em --progreso-inicio
    bar.style.transition = "none";
    bar.style.width = START_PCT + "%";

    // na prÃ³xima â€œpintadaâ€ de frame, aplica a transiÃ§Ã£o
    requestAnimationFrame(() => {
        // garante que o estilo inicial foi aplicado
        requestAnimationFrame(() => {
            // anima em 2 segundos, suave
            bar.style.transition = "width 2s ease-out";
            bar.style.width = END_PCT + "%";
        });
    });
}

/* (resto do seu cÃ³digo DOMContentLoaded continua igual daqui pra baixo) */

            /* ===============================
               ANIMAÃ‡ÃƒO DA LOGO AO ROLAR PÃGINA
               =============================== */
            const logo = document.getElementById("logoTop");

            function onScroll() {
                if (!logo) return;
                if (window.scrollY > 40) {
                    logo.classList.add("logo-scrolled");
                } else {
                    logo.classList.remove("logo-scrolled");
                }
            }

            if (logo) {
                window.addEventListener("scroll", onScroll, { passive: true });
            }

            /* ===============================
               FUNÃ‡ÃƒO GENÃ‰RICA PRA WAVE
               =============================== */
            function aplicarWaveNosBotoes(nodeList) {
                nodeList.forEach((btn, index) => {
                    const delay = 0.12 * index + 0.15;
                    btn.style.animation = "optionWave 0.7s ease forwards";
                    btn.style.animationDelay = `${delay}s`;
                });
            }

            const optionButtons = document.querySelectorAll(".option-btn");
            const checkOptionButtons = document.querySelectorAll(".check-option-btn");

            // Wave inicial
            aplicarWaveNosBotoes(optionButtons);
            aplicarWaveNosBotoes(checkOptionButtons);

            // Repetir wave a cada 6 segundos
            setInterval(() => {
                [optionButtons, checkOptionButtons].forEach(group => {
                    group.forEach((btn, index) => {
                        btn.style.animation = "none";
                        void btn.offsetWidth; // forÃ§a reflow pra resetar
                        const delay = 0.12 * index;
                        btn.style.animation = "optionWave 0.7s ease forwards";
                        btn.style.animationDelay = `${delay}s`;
                    });
                });
            }, 6000);

            /* ===============================
               LÃ“GICA DE SELEÃ‡ÃƒO MULTI (CHECK)
               =============================== */
     const btnContinuar = document.getElementById("btnContinuar");

function atualizarEstadoBotaoContinuar() {
    if (!btnContinuar) return;

    const algumSelecionado = [...checkOptionButtons].some(b =>
        b.classList.contains("is-checked")
    );

    if (algumSelecionado) {
        btnContinuar.classList.remove("btn-model-disabled");
        btnContinuar.classList.add("btn-model-enabled");
        btnContinuar.disabled = false;
        btnContinuar.textContent = "Continuar â†’";
    } else {
        btnContinuar.classList.add("btn-model-disabled");
        btnContinuar.classList.remove("btn-model-enabled");
        btnContinuar.disabled = true;
        btnContinuar.textContent = "Selecciona alguna Ã¡rea arriba";
    }
}
if (btnContinuar) {
    btnContinuar.addEventListener("click", () => {
        if (!btnContinuar.disabled) {
            window.location.href = "pagina5.html";
        }
    });
}

// LÃ“GICA DE SELEÃ‡ÃƒO MULTI (CHECK)
checkOptionButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle("is-checked");
        atualizarEstadoBotaoContinuar();
    });
});

// Garante estado inicial correto ao carregar a pÃ¡gina
atualizarEstadoBotaoContinuar();

        });
        } catch (e) {
                console.warn("Erro4:", e);
        }

        try {
        (function () {
            const analisisBloque = document.getElementById('analisisBloque');
            const percentEl = document.getElementById('analisisPercent');
            const steps = Array.from(document.querySelectorAll('.analisis-step'));

            if (!analisisBloque || !percentEl || !steps.length) {
                return;
            }

            let analisisIniciada = false;
            let timerPercent = null;

            // Estado inicial: 0% + sÃ³ o passo 1 ativo
            function prepararAnalisisInicial() {
                if (!analisisBloque || !percentEl || !steps.length) return;

                percentEl.textContent = '0%';

                steps.forEach((step, i) => {
                    step.classList.remove('is-active', 'is-done');
                    if (i === 0) {
                        step.classList.add('is-active');
                    }
                });
            }

            function setStep(idx) {
                steps.forEach((step, i) => {
                    step.classList.remove('is-active', 'is-done');

                    if (i < idx) {
                        step.classList.add('is-done');   // passos anteriores = concluÃ­dos
                    } else if (i === idx) {
                        step.classList.add('is-active'); // passo atual
                    }
                });
            }

            function finalizarAnalisis() {
                steps.forEach(step => {
                    step.classList.remove('is-active');
                    step.classList.add('is-done');
                });
                percentEl.textContent = '100%';
                analisisBloque.classList.add('analisis-completa');
            }

            function iniciarAnalisis() {
                if (analisisIniciada) return; // evita rodar duas vezes
                analisisIniciada = true;

                // opcional: rolar atÃ© o bloco
                analisisBloque.scrollIntoView({ behavior: 'smooth', block: 'start' });

                const duracaoTotal = 12000; // 12s
                const passoMs = 120;   // atualizaÃ§Ã£o a cada 120ms
                let elapsed = 0;

                setStep(0); // comeÃ§a no passo 1

                timerPercent = setInterval(() => {
                    elapsed += passoMs;
                    const progress = Math.min(1, elapsed / duracaoTotal);
                    const percent = Math.round(progress * 100);
                    percentEl.textContent = percent + '%';

                    // Troca de passos
                    if (elapsed >= 4000 && elapsed < 8000) {
                        setStep(1); // passo 2
                    } else if (elapsed >= 8000 && elapsed < 12000) {
                        setStep(2); // passo 3
                    }

                    // Finaliza
                    if (elapsed >= duracaoTotal) {
                        clearInterval(timerPercent);
                        finalizarAnalisis();
                    }
                }, passoMs);
            }

            // Prepara o bloco assim que carregar
            prepararAnalisisInicial();
            // Inicia automaticamente ao abrir a pÃ¡gina
            window.addEventListener('load', () => {
                setTimeout(() => {
                    iniciarAnalisis();
                }, 500); // pequeno delay opcional para suavidade
            });

            // Se tambÃ©m quiser iniciar pelo botÃ£o fixo de baixo, descomenta:
            // const btnFooter = document.querySelector('.btn-cta');
            // if (btnFooter) {
            //   btnFooter.addEventListener('click', iniciarAnalisis);
            // }

        })();
        } catch (e) {
            console.warn("Erro5:", e);
        }
        try {
        document.addEventListener('DOMContentLoaded', () => {
            const wrapper = document.getElementById('riesgoWrapper');
            const marker = document.getElementById('riesgoMarker');
            const valorEl = document.getElementById('riesgoValor');

            if (!wrapper || !marker || !valorEl) return;

            let imc = parseFloat(wrapper.getAttribute('data-imc') || valorEl.textContent) || 0;

            // ðŸ”§ Faixa usada para mapear a barra
            // Deixa propositalmente mais curta pra maioria jÃ¡ cair em zona amarela/vermelha
            const MIN_IMC = 10;  // inÃ­cio visual da barra
            const MAX_IMC = 26;  // fim visual da barra (vermelho forte)

            let t = (imc - MIN_IMC) / (MAX_IMC - MIN_IMC);
            t = Math.max(0, Math.min(1, t)); // clamp 0â€“1

            const leftPercent = t * 100;
            marker.style.left = leftPercent + '%';

            valorEl.textContent = imc.toFixed(2);
        });
        } catch (e) {
                console.warn("Erro6:", e);
        }
        try {
        // ðŸ”¢ Valores que vocÃª pode mudar depois
        const PESO_HOY = 76;  // Semana 1
        const PESO_SEM2 = 60;  // Semana 2 (simulaÃ§Ã£o)
        const PESO_DESPUES = 70;  // Semana 3 (peso objetivo / depois)
        const PESO_SEM4 = 68;  // Semana 4 (mantendo resultado)

        const LABEL_HOY = `Tu peso hoy: ${PESO_HOY} KG`;
        const LABEL_DESPUES = `Tu peso despuÃ©s: ${PESO_DESPUES} KG`;

        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(initPesoChart);

        function initPesoChart() {
            drawPesoChart();
            window.addEventListener('resize', drawPesoChart);
        }

        function drawPesoChart() {
            const container = document.getElementById('pesoChart');
            if (!container) return;

            // limpa labels antigos
            [...container.querySelectorAll('.peso-label')].forEach(el => el.remove());

            const data = new google.visualization.DataTable();
            data.addColumn('string', 'Semana');
            data.addColumn('number', 'Peso');

            // 5 pontos: Inicio, Semana 1, Semana 2, Semana 3, Semana 4
            data.addRows([
                ['Inicio', PESO_HOY],      // pode ser igual ao de hoje pra linha comeÃ§ar no mesmo ponto
                ['Semana 1', PESO_HOY],
                ['Semana 2', PESO_SEM2],
                ['Semana 3', PESO_DESPUES],
                ['Semana 4', PESO_SEM4]
            ]);

            const width = container.offsetWidth || 360;
            const height = Math.max(230, Math.round(width * 0.6));

            const options = {
                backgroundColor: 'transparent',
                legend: 'none',
                width: width,
                height: height,
                areaOpacity: 0.16,
                colors: ['#2563eb'],
                lineWidth: 4,
                curveType: 'function',
                chartArea: {
                    left: 45,
                    top: 20,
                    right: 16,
                    bottom: 40
                },
                hAxis: {
                    textStyle: { fontName: 'Nunito', fontSize: 11, color: '#4b5563' },
                    gridlines: { color: '#e5e7eb' }
                },
                vAxis: {
                    minValue: 0,
                    textStyle: { fontName: 'Nunito', fontSize: 11, color: '#4b5563' },
                    gridlines: { color: '#e5e7eb' }
                },
                pointSize: 7
            };

            const chart = new google.visualization.AreaChart(container);

            // desenha e, quando estiver pronto, posiciona os balÃµes
            google.visualization.events.addListener(chart, 'ready', () => {
                const cli = chart.getChartLayoutInterface();

                // helper pra criar label
                function makeLabel(rowIndex, text, className, offsetX = 0, offsetY = -32) {
                    const x = cli.getXLocation(data.getValue(rowIndex, 0));
                    const y = cli.getYLocation(data.getValue(rowIndex, 1));

                    const label = document.createElement('div');
                    label.className = `peso-label ${className}`;
                    label.textContent = text;

                    // posiÃ§Ã£o relativa ao container
                    const plotArea = cli.getChartAreaBoundingBox();
                    const left = x - container.offsetLeft;
                    const top = y - container.offsetTop;

                    label.style.left = (left + offsetX - 40) + 'px'; // 40 pra centralizar melhor
                    label.style.top = (top + offsetY) + 'px';

                    container.appendChild(label);
                }

                // Semana 1 (Ã­ndice 1) â€“ peso hoje, fundo branco
                makeLabel(1, LABEL_HOY, 'peso-label-hoy', -10, -40);

                // Semana 3 (Ã­ndice 3) â€“ peso depois, fundo azul
                makeLabel(3, LABEL_DESPUES, 'peso-label-despues', -10, -40);
            });

            chart.draw(data, options);
        }
    } catch (e) {
    console.warn("Erro7:", e);
}
// O envio extra para endpoint externo foi removido para manter o tracking isolado
// dentro da estrutura prÃ³pria do projeto.


