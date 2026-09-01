(() => {
  const sections = new Set(["about", "work", "contact"]);
  const stage = document.querySelector("#stage");
  let active = null;
  let transitionTimer = null;

  function routeFromPath(pathname) {
    const part = pathname.split("/").filter(Boolean)[0];
    return sections.has(part) ? part : "about";
  }

  function prepareAbout(container) {
    const lines = [...container.querySelectorAll(".about-line")];
    const timings = [
      { start: .12, step: .085 },
      { start: 2.05, step: .13 },
      { start: 3.35, step: .2 },
    ];

    lines.forEach((line, lineIndex) => {
      const words = line.textContent.trim().split(/\s+/);
      line.textContent = "";
      words.forEach((word, wordIndex) => {
        const span = document.createElement("span");
        const lastWord = lineIndex === 2 && wordIndex === words.length - 1;
        span.className = "reveal-word";
        span.style.setProperty("--delay", `${lastWord ? 4.35 : timings[lineIndex].start + timings[lineIndex].step * wordIndex}s`);
        if (lastWord) {
          const em = document.createElement("em");
          em.textContent = word;
          span.append(em);
        } else {
          span.textContent = word;
        }
        line.append(span, wordIndex < words.length - 1 ? " " : "");
      });
    });
  }

  function updateNavigation(section) {
    document.querySelectorAll("[data-route]").forEach((link) => {
      if (link.closest("nav") && link.dataset.route === section) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function render(section, animate = true) {
    window.clearTimeout(transitionTimer);
    if (section === active) return;

    const commit = () => {
      stage.className = "stage phase-pre";
      stage.replaceChildren(document.querySelector(`#${section}-template`).content.cloneNode(true));
      if (section === "about") prepareAbout(stage);
      updateNavigation(section);
      active = section;
      requestAnimationFrame(() => requestAnimationFrame(() => { stage.className = "stage phase-in"; }));
    };

    if (animate && active) {
      stage.className = "stage phase-out";
      transitionTimer = window.setTimeout(commit, 500);
    } else {
      commit();
    }
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-route]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = link.dataset.route;
    if (section !== active) history.pushState({ section }, "", `/${section}/`);
    render(section);
  });

  window.addEventListener("popstate", () => render(routeFromPath(location.pathname)));
  render(routeFromPath(location.pathname), false);
})();
