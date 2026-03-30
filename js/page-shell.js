(() => {
  const state =
    window.__pageShellState ||
    (window.__pageShellState = {
      posthogInitialized: false,
      scriptLoads: new Map(),
    });

  const fontStylesheet =
    "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap";
  const shellMarkup = `
    <canvas id="particle-canvas"></canvas>
    <div id="content">
      <header class="header">
        <a href="/" class="site-home-link"><h1>Jasjeet Mavi</h1></a>
        <nav class="actions">
          <button id="theme-toggle" aria-label="Toggle color mode">
            <svg class="moon icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor">
              <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
            </svg>
            <svg class="sun icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"></path>
            </svg>
          </button>
          <a href="/projects/" class="action">Projects</a>
        </nav>
      </header>
    </div>
  `;

  function ensureHeadLink({ rel, href, crossOrigin }) {
    const existing = document.head.querySelector(
      `link[rel="${rel}"][href="${href}"]`
    );

    if (existing) {
      return existing;
    }

    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;

    if (crossOrigin !== undefined) {
      link.setAttribute("crossorigin", crossOrigin);
    }

    document.head.appendChild(link);
    return link;
  }

  function ensureFonts() {
    ensureHeadLink({
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    });
    ensureHeadLink({
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "",
    });
    ensureHeadLink({
      rel: "stylesheet",
      href: fontStylesheet,
    });
  }

  function ensurePosthog() {
    if (state.posthogInitialized) {
      return;
    }

    !(function (t, e) {
      var o, n, p, r;
      e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
          function g(t, e) {
            var o = e.split(".");
            2 == o.length && ((t = t[o[0]]), (e = o[1])),
              (t[e] = function () {
                t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
              });
          }
          ((p = t.createElement("script")).type = "text/javascript"),
            (p.async = !0),
            (p.src =
              s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
              "/static/array.js"),
            (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
              p,
              r
            );
          var u = e;
          for (
            void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
              u.people = u.people || [],
              u.toString = function (t) {
                var e = "posthog";
                return (
                  "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
                );
              },
              u.people.toString = function () {
                return u.toString(1) + ".people (stub)";
              },
              o =
                "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(
                  " "
                ),
              n = 0;
            n < o.length;
            n++
          )
            g(u, o[n]);
          e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
    })(document, window.posthog || []);

    window.posthog.init("phc_OwLIUOfhnFUdKGFFJIr8R0UkjAVg4oQlB5vX6c2hyOE", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
    });

    state.posthogInitialized = true;
  }

  function ensureScript(src) {
    const resolvedSrc = new URL(src, window.location.origin).href;

    if (state.scriptLoads.has(resolvedSrc)) {
      return state.scriptLoads.get(resolvedSrc);
    }

    const existing = Array.from(document.scripts).find(
      (script) => script.src === resolvedSrc
    );

    if (existing) {
      const existingLoad = new Promise((resolve, reject) => {
        if (existing.dataset.pageShellLoaded === "true") {
          resolve();
          return;
        }

        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
      });

      state.scriptLoads.set(resolvedSrc, existingLoad);
      return existingLoad;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;

    const loadPromise = new Promise((resolve, reject) => {
      script.addEventListener(
        "load",
        () => {
          script.dataset.pageShellLoaded = "true";
          resolve();
        },
        { once: true }
      );
      script.addEventListener("error", reject, { once: true });
    });

    state.scriptLoads.set(resolvedSrc, loadPromise);
    document.body.appendChild(script);
    return loadPromise;
  }

  function enhanceShells() {
    const wrappers = document.querySelectorAll("[data-page-shell]");

    wrappers.forEach((wrapper) => {
      if (wrapper.dataset.pageShellEnhanced === "true") {
        return;
      }

      const main = wrapper.querySelector(":scope > main");

      if (!main) {
        return;
      }

      wrapper.innerHTML = shellMarkup;
      wrapper.querySelector("#content").appendChild(main);
      wrapper.dataset.pageShellEnhanced = "true";
    });

    return wrappers.length > 0;
  }

  function init() {
    ensureFonts();
    ensurePosthog();

    if (!enhanceShells()) {
      return;
    }

    ensureScript("/js/theme-toggle.js");
    ensureScript("/js/particle-effect.js");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
