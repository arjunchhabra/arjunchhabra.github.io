(() => {
  const sections = new Set(["about", "work", "contact"]);
  const stage = document.querySelector("#stage");
  let active = null;
  let transitionTimer = null;

  function routeFromPath(pathname) {
    const part = pathname.split("/").filter(Boolean)[0];
    return sections.has(part) ? part : "about";
  }

  function pathForSection(section) {
    return section === "about" ? "/" : `/${section}/`;
  }

  function prepareAbout(container) {
    const lines = [...container.querySelectorAll(".about-line")];
    const timings = [
      { start: .144, step: .09 },
      { start: 2.22, step: .114 },
      { start: 4.02, step: .24 },
    ];

    lines.forEach((line, lineIndex) => {
      const words = line.textContent.trim().split(/\s+/);
      line.textContent = "";
      words.forEach((word, wordIndex) => {
        const span = document.createElement("span");
        const lastWord = lineIndex === 2 && wordIndex === words.length - 1;
        span.className = "reveal-word";
        span.style.setProperty("--delay", `${lastWord ? 5.22 : timings[lineIndex].start + timings[lineIndex].step * wordIndex}s`);
        span.textContent = word;
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
    const path = pathForSection(section);
    if (location.pathname !== path) history.pushState({ section }, "", path);
    render(section);
  });

  window.addEventListener("popstate", () => render(routeFromPath(location.pathname)));
  render(routeFromPath(location.pathname), false);
})();
