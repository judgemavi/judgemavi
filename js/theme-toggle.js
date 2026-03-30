(() => {
  const STORAGE_KEY = 'theme-preference';
  const state =
    window.__themeToggleState ||
    (window.__themeToggleState = {
      initialized: false,
      systemThemeListenerBound: false,
      clickListenerBound: false,
    });

  function getSystemThemeMediaQuery() {
    if (typeof window.matchMedia !== 'function') {
      return null;
    }

    return state.systemThemeMediaQuery ||
      (state.systemThemeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ));
  }

  function getSystemTheme() {
    return getSystemThemeMediaQuery()?.matches ? 'dark' : 'light';
  }

  function getStoredTheme() {
    try {
      const storedTheme = window.localStorage.getItem(STORAGE_KEY);

      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    } catch {}

    return null;
  }

  function setStoredTheme(theme) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }

  function getPreferredTheme() {
    return state.manualTheme || getStoredTheme();
  }

  function getAppliedTheme() {
    const currentTheme = document.body?.getAttribute('data-theme');

    if (currentTheme === 'light' || currentTheme === 'dark') {
      return currentTheme;
    }

    return getSystemTheme();
  }

  function applyTheme(theme) {
    if (!document.body) {
      return;
    }

    document.body.setAttribute('data-theme', theme);
  }

  function syncTheme() {
    if (!document.body) {
      return;
    }

    const storedTheme = getPreferredTheme();
    const theme =
      storedTheme || (state.initialized ? getAppliedTheme() : getSystemTheme());

    applyTheme(theme);
    state.initialized = true;
  }

  function toggleTheme() {
    if (!document.body) {
      return;
    }

    const nextTheme = getAppliedTheme() === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme);
    state.manualTheme = nextTheme;
    setStoredTheme(nextTheme);
  }

  function handleDocumentClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (!event.target.closest('#theme-toggle')) {
      return;
    }

    toggleTheme();
  }

  function handleSystemThemeChange(event) {
    if (getPreferredTheme()) {
      return;
    }

    applyTheme(event.matches ? 'dark' : 'light');
  }

  function bindThemeToggle() {
    if (state.clickListenerBound) {
      return;
    }

    document.addEventListener('click', handleDocumentClick);
    state.clickListenerBound = true;
  }

  function bindSystemThemeListener() {
    if (state.systemThemeListenerBound) {
      return;
    }

    const systemThemeMediaQuery = getSystemThemeMediaQuery();

    if (!systemThemeMediaQuery) {
      return;
    }

    if (typeof systemThemeMediaQuery.addEventListener === 'function') {
      systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (typeof systemThemeMediaQuery.addListener === 'function') {
      systemThemeMediaQuery.addListener(handleSystemThemeChange);
    }

    state.systemThemeListenerBound = true;
  }

  syncTheme();
  bindThemeToggle();
  bindSystemThemeListener();
})();
