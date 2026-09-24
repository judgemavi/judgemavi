function bindDrag(field, win, moved, zIndex) {
  const bar = win.querySelector(".titlebar");
  if (!bar) {
    return zIndex;
  }

  const name =
    bar.querySelector(".company-name")?.textContent?.trim() ||
    bar.querySelector("span")?.textContent?.trim() ||
    "window";
  bar.tabIndex = 0;
  bar.title = "Drag to move";
  bar.style.touchAction = "none";
  bar.style.cursor = "grab";
  bar.setAttribute("aria-label", `Move ${name}`);
  let dragged = false;

  bar.addEventListener(
    "click",
    (event) => {
      if (dragged) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );

  bar.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 28 : 12;
    let dx = 0;
    let dy = 0;
    if (event.key === "ArrowLeft") dx = -step;
    else if (event.key === "ArrowRight") dx = step;
    else if (event.key === "ArrowUp") dy = -step;
    else if (event.key === "ArrowDown") dy = step;
    else return;

    event.preventDefault();
    moved.add(win);
    zIndex += 1;
    win.style.zIndex = String(zIndex);
    const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
    const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
    win.style.left = `${Math.min(Math.max(0, (parseFloat(win.style.left) || 0) + dx), maxX)}px`;
    win.style.top = `${Math.min(Math.max(0, (parseFloat(win.style.top) || 0) + dy), maxY)}px`;
  });

  bar.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    dragged = false;
    zIndex += 1;
    win.style.zIndex = String(zIndex);
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
        dragged = true;
        moved.add(win);
      }
      const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
      const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
      win.style.left = `${Math.min(Math.max(0, originX + dx), maxX)}px`;
      win.style.top = `${Math.min(Math.max(0, originY + dy), maxY)}px`;
    };
    const onUp = () => {
      win.classList.remove("is-dragging");
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
      bar.removeEventListener("pointercancel", onUp);
    };
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    bar.addEventListener("pointercancel", onUp);
  });

  return zIndex;
}

function mountPlateField(selector) {
  const field = document.querySelector(selector);
  if (!field || field.dataset.plateReady === "true") {
    return;
  }
  field.dataset.plateReady = "true";

  const cards = [...field.querySelectorAll(":scope > .window")];
  const moved = new Set();
  let z = 3;
  let layingOut = false;

  function layout() {
    if (layingOut) {
      return;
    }
    layingOut = true;
    const width = field.clientWidth;
    if (!width) {
      layingOut = false;
      return;
    }

    const narrow = width < 700;
    const cardWidth = narrow ? width : Math.min(360, Math.floor(width * 0.46));
    cards.forEach((card) => {
      card.style.position = "absolute";
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
    const bottom = cards.reduce(
      (max, card) => Math.max(max, (parseFloat(card.style.top) || 0) + card.offsetHeight),
      0
    );
    field.style.height = `${bottom + 12}px`;
    field.dataset.arranged = "true";
    layingOut = false;
  }

  cards.forEach((card) => {
    z = bindDrag(field, card, moved, z);
  });
  layout();
  window.addEventListener("resize", layout);
}

(() => {
  const field = document.querySelector(".desk-field");
  if (!field || field.dataset.deskReady === "true") {
    return;
  }
  field.dataset.deskReady = "true";

  const windows = [...field.querySelectorAll(":scope > .window")];
  const moved = new Set();
  let z = 3;
  let layingOut = false;

  const byClass = (name) => field.querySelector(`.${name}`);

  function clamp(win) {
    const maxX = Math.max(0, field.clientWidth - win.offsetWidth);
    const maxY = Math.max(0, field.clientHeight - win.offsetHeight);
    const x = Math.min(Math.max(0, parseFloat(win.style.left) || 0), maxX);
    const y = Math.min(Math.max(0, parseFloat(win.style.top) || 0), maxY);
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  }

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
        clamp(win);
      }
    });
  }

  function layout() {
    if (layingOut) {
      return;
    }
    layingOut = true;

    const width = field.clientWidth;
    const about = byClass("window-about");
    const contact = byClass("window-contact");
    const profile = byClass("window-profile");
    const stack = byClass("window-stack");
    const now = byClass("window-now");
    if (profile) {
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
    layingOut = false;
  }

  windows.forEach((win) => {
    z = bindDrag(field, win, moved, z);
  });

  layout();
  window.addEventListener("resize", layout);
})();

mountPlateField(".record-list");
mountPlateField(".project-list");
