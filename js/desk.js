function bringForward(layer, win) {
  layer.z += 1;
  win.style.zIndex = String(layer.z);
}

function dimensionKey(field, cards) {
  return `${field.clientWidth}|${cards.map((c) => `${c.offsetWidth}x${c.offsetHeight}`).join(",")}`;
}

function bindDrag(field, win, moved, layer) {
  const bar = win.querySelector(".titlebar");
  if (!bar) {
    return;
  }

  const name =
    bar.querySelector(".company-name")?.textContent?.trim() ||
    bar.querySelector("span")?.textContent?.trim() ||
    "window";
  bar.tabIndex = 0;
  bar.title = "Drag to move. Focus the handle and use arrow keys; Shift for larger steps.";
  bar.style.touchAction = "none";
  bar.style.cursor = "grab";
  bar.setAttribute(
    "aria-label",
    `Move ${name}. Arrow keys move the card; hold Shift for larger steps.`
  );
  bar.setAttribute("aria-keyshortcuts", "ArrowLeft ArrowRight ArrowUp ArrowDown");

  // Suppress only the click synthesized after a completed drag, then clear.
  // Must not survive pointercancel or a later pointer/keyboard activation.
  let suppressClick = false;

  const clearClickSuppression = () => {
    suppressClick = false;
  };

  // Any new pointer gesture clears stale suppression before click handlers run.
  win.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) {
        return;
      }
      clearClickSuppression();
      bringForward(layer, win);
    },
    true
  );

  bar.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      clearClickSuppression();
    },
    true
  );

  bar.addEventListener("keydown", (event) => {
    // Nested controls (company links): never inherit drag click-suppression.
    if (event.target !== bar) {
      clearClickSuppression();
      return;
    }

    const step = event.shiftKey ? 28 : 12;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else {
      // Enter/Space etc. on the handle — don't block a following activation click.
      clearClickSuppression();
      return;
    }

    event.preventDefault();
    moved.add(win);
    bringForward(layer, win);
    const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
    const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
    win.style.left = `${Math.min(Math.max(0, (parseFloat(win.style.left) || 0) + dx), maxX)}px`;
    win.style.top = `${Math.min(Math.max(0, (parseFloat(win.style.top) || 0) + dy), maxY)}px`;
  });

  bar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    // Don't start a drag from nested interactive controls (e.g. company links).
    if (event.target.closest("a, button, input, textarea, select")) {
      return;
    }
    const originX = parseFloat(win.style.left) || 0;
    const originY = parseFloat(win.style.top) || 0;
    const startX = event.clientX;
    const startY = event.clientY;
    win.classList.add("is-dragging");
    bar.setPointerCapture(event.pointerId);

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 4) {
        suppressClick = true;
        moved.add(win);
      }
      const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
      const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
      win.style.left = `${Math.min(Math.max(0, originX + dx), maxX)}px`;
      win.style.top = `${Math.min(Math.max(0, originY + dy), maxY)}px`;
    };
    const onEnd = (endEvent) => {
      win.classList.remove("is-dragging");
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onEnd);
      bar.removeEventListener("pointercancel", onEnd);
      // Cancelled: no drag-click to suppress. Do not clear on pointerup —
      // the synthesized click still needs suppressClick until it is consumed.
      if (endEvent.type === "pointercancel") {
        clearClickSuppression();
      }
    };
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onEnd);
    bar.addEventListener("pointercancel", onEnd);
  });
}

function clearMoved(moved, cards) {
  moved.clear();
  cards.forEach((card) => {
    card.style.left = "";
    card.style.top = "";
  });
}

function clampCard(field, win) {
  const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
  const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
  const x = Math.min(Math.max(0, parseFloat(win.style.left) || 0), maxX);
  const y = Math.min(Math.max(0, parseFloat(win.style.top) || 0), maxY);
  win.style.left = `${x}px`;
  win.style.top = `${y}px`;
}

function observeLayout(field, cards, schedule) {
  let ignore = false;
  let pending = false;
  let lastLaidOutKey = "";

  const run = () => {
    if (ignore) {
      pending = true;
      return;
    }
    const key = dimensionKey(field, cards);
    if (key === lastLaidOutKey && field.dataset.arranged === "true") {
      return;
    }
    schedule();
  };

  const ro = new ResizeObserver(run);
  ro.observe(field);
  cards.forEach((card) => ro.observe(card));

  return {
    suppress(fn) {
      ignore = true;
      pending = false;
      try {
        const ok = fn();
        if (ok !== false) {
          lastLaidOutKey = dimensionKey(field, cards);
        }
      } finally {
        // Release after the browser applies layout so RO callbacks from our own
        // writes are skipped; then catch any real size change that arrived
        // during the window or after our recorded key.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ignore = false;
            const key = dimensionKey(field, cards);
            if (pending || key !== lastLaidOutKey) {
              pending = false;
              schedule();
            }
          });
        });
      }
    },
    disconnect() {
      ro.disconnect();
    },
  };
}

function onFontsReady(callback) {
  if (document.fonts?.ready) {
    document.fonts.ready.then(callback).catch(() => {});
  }
  if (document.fonts?.addEventListener) {
    document.fonts.addEventListener("loadingdone", callback);
  }
}

function mountPlateField(selector) {
  const field = document.querySelector(selector);
  if (!field || field.dataset.plateReady === "true") {
    return;
  }
  field.dataset.plateReady = "true";

  const cards = [...field.querySelectorAll(":scope > .window")];
  const moved = new Set();
  const layer = { z: 3 };
  let layingOut = false;
  let scheduled = false;
  let wasNarrow = null;
  let observer;

  function layout() {
    if (layingOut) {
      return;
    }
    layingOut = true;

    const apply = () => {
      const width = field.clientWidth;
      if (!width) {
        return false;
      }

      const narrow = width < 700;
      if (wasNarrow !== null && wasNarrow !== narrow) {
        clearMoved(moved, cards);
      }
      wasNarrow = narrow;

      const cardWidth = narrow ? width : Math.min(360, Math.floor(width * 0.46));
      cards.forEach((card) => {
        card.style.width = `${cardWidth}px`;
      });

      const columns = [
        { x: narrow ? 0 : Math.round(width * 0.04), y: 0 },
        {
          x: narrow ? 0 : Math.max(0, width - cardWidth - Math.round(width * 0.02)),
          y: narrow ? 0 : 48,
        },
      ];
      cards.forEach((card, index) => {
        const column = columns[narrow ? 0 : index % 2];
        const y = column.y;
        if (!moved.has(card)) {
          card.style.left = `${column.x}px`;
          card.style.top = `${y}px`;
        }
        column.y = y + card.offsetHeight + (narrow ? 18 : 28);
      });

      // Size the field from current card tops first, then clamp moved cards
      // so maxY reflects the expanded container (avoids clipping after resize).
      const bottom = cards.reduce(
        (max, card) => Math.max(max, (parseFloat(card.style.top) || 0) + card.offsetHeight),
        0
      );
      field.style.height = `${bottom + 12}px`;
      cards.forEach((card) => {
        if (moved.has(card)) {
          clampCard(field, card);
        }
      });

      field.dataset.arranged = "true";
      return true;
    };

    if (observer) {
      observer.suppress(apply);
    } else {
      apply();
    }
    layingOut = false;
  }

  function schedule() {
    if (scheduled || layingOut) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      layout();
    });
  }

  cards.forEach((card) => {
    bindDrag(field, card, moved, layer);
  });

  observer = observeLayout(field, cards, schedule);
  layout();
  window.addEventListener("resize", schedule);
  onFontsReady(schedule);
}

(() => {
  const field = document.querySelector(".desk-field");
  if (!field || field.dataset.deskReady === "true") {
    return;
  }
  field.dataset.deskReady = "true";

  const windows = [...field.querySelectorAll(":scope > .window")];
  const moved = new Set();
  const layer = { z: 3 };
  let layingOut = false;
  let scheduled = false;
  let wasDesktop = null;
  let observer;

  const byClass = (name) => field.querySelector(`.${name}`);

  function place(win, x, y) {
    if (!win || moved.has(win)) {
      return;
    }
    win.style.left = `${Math.max(0, x)}px`;
    win.style.top = `${Math.max(0, y)}px`;
  }

  function fitField() {
    const bottom = windows.reduce(
      (max, win) => Math.max(max, (parseFloat(win.style.top) || 0) + win.offsetHeight),
      0
    );
    field.style.minHeight = `${bottom + 36}px`;
    windows.forEach((win) => {
      if (moved.has(win)) {
        clampCard(field, win);
      }
    });
  }

  function layout() {
    if (layingOut) {
      return;
    }
    layingOut = true;

    const apply = () => {
      const width = field.clientWidth;
      if (!width) {
        return false;
      }

      const about = byClass("window-about");
      const contact = byClass("window-contact");
      const profile = byClass("window-profile");
      const stack = byClass("window-stack");
      const now = byClass("window-now");
      if (profile && !moved.has(profile)) {
        profile.style.width = "";
      }
      const gap = 28;
      const row = (about?.offsetHeight || 140) + gap;
      const contactX = width - (contact?.offsetWidth || 0);
      const nowX = width - (now?.offsetWidth || 0);
      const stackX = (profile?.offsetWidth || 0) + gap;
      const desktop =
        width >= stackX + (stack?.offsetWidth || 0) + gap + (now?.offsetWidth || 0) &&
        (about?.offsetWidth || 0) + gap + (contact?.offsetWidth || 0) <= width + 8;

      if (wasDesktop !== null && wasDesktop !== desktop) {
        clearMoved(moved, windows);
        if (profile) {
          profile.style.width = "";
        }
      }
      wasDesktop = desktop;

      if (desktop) {
        place(about, 0, 0);
        place(contact, contactX, 36);
        place(profile, 0, row);
        place(stack, stackX, row + 16);
        place(now, nowX, row + 56);
      } else {
        const pairGap = 16;
        if (profile && contact && !moved.has(profile)) {
          const room = width - pairGap - contact.offsetWidth;
          profile.style.width = `${Math.min(200, Math.max(140, room))}px`;
        }
        let y = 0;
        place(about, 0, y);
        if (about && !moved.has(about)) {
          y += about.offsetHeight + 16;
        }
        const rowY = y;
        place(profile, 0, rowY);
        place(contact, (profile?.offsetWidth || 0) + pairGap, rowY);
        const rowHeight = Math.max(
          profile && !moved.has(profile) ? profile.offsetHeight : 0,
          contact && !moved.has(contact) ? contact.offsetHeight : 0
        );
        if (rowHeight) {
          y = rowY + rowHeight + 16;
        }
        [stack, now].forEach((win) => {
          place(win, 0, y);
          if (win && !moved.has(win)) {
            y += win.offsetHeight + 16;
          }
        });
      }

      fitField();
      field.dataset.arranged = "true";
      return true;
    };

    if (observer) {
      observer.suppress(apply);
    } else {
      apply();
    }
    layingOut = false;
  }

  function schedule() {
    if (scheduled || layingOut) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      layout();
    });
  }

  windows.forEach((win) => {
    bindDrag(field, win, moved, layer);
  });

  observer = observeLayout(field, windows, schedule);
  layout();
  window.addEventListener("resize", schedule);
  onFontsReady(schedule);
})();

mountPlateField(".record-list");
mountPlateField(".project-list");
