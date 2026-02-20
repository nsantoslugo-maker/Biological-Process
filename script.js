const stage = document.getElementById("stage");
const addCircleBtn = document.getElementById("addCircleBtn");
const eraseBtn = document.getElementById("eraseBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const swatches = Array.from(document.querySelectorAll(".swatch"));

let selectedCircle = null;
let currentColor = "#111827";

// --- Color picker ---
function setColor(color) {
  currentColor = color;
  swatches.forEach(s => s.classList.toggle("selected", s.dataset.color === color));
  // Apply color to selected circle text (if any)
  if (selectedCircle) {
    selectedCircle.querySelector(".circle-inner").style.color = color;
    selectedCircle.querySelector(".circle-inner").focus();
  }
}
setColor(currentColor);

swatches.forEach(swatch => {
  swatch.addEventListener("click", () => setColor(swatch.dataset.color));
});

// --- Select circle ---
function selectCircle(circleEl) {
  if (selectedCircle) selectedCircle.classList.remove("selected");
  selectedCircle = circleEl;
  if (selectedCircle) selectedCircle.classList.add("selected");
}

stage.addEventListener("mousedown", (e) => {
  const circle = e.target.closest(".circle");
  if (!circle) {
    selectCircle(null);
    return;
  }
  selectCircle(circle);
});

// --- Erase selected ---
eraseBtn.addEventListener("click", () => {
  if (!selectedCircle) return;
  selectedCircle.querySelector(".circle-inner").innerText = "";
  selectedCircle.querySelector(".circle-inner").focus();
});

// --- Clear all ---
clearAllBtn.addEventListener("click", () => {
  document.querySelectorAll(".circle-inner").forEach(el => (el.innerText = ""));
  selectCircle(null);
});

// --- Add new circle ---
addCircleBtn.addEventListener("click", () => {
  const circle = document.createElement("div");
  circle.className = "circle";
  circle.style.left = "45%";
  circle.style.top = "55%";

  circle.innerHTML = `
    <div class="circle-inner" contenteditable="true" spellcheck="false" aria-label="Editable circle"></div>
    <span class="handle" title="Drag to move"></span>
  `;

  stage.appendChild(circle);
  selectCircle(circle);

  const inner = circle.querySelector(".circle-inner");
  inner.style.color = currentColor;
  inner.focus();

  wireCircle(circle);
});

// --- Make circles draggable (grab the handle) ---
function wireCircle(circle) {
  const handle = circle.querySelector(".handle");
  const inner = circle.querySelector(".circle-inner");

  // When typing, keep the selected circle and allow text color changes
  inner.addEventListener("focus", () => {
    selectCircle(circle);
  });

  // If student clicks inside and there's no color set yet, match current
  inner.addEventListener("click", () => {
    selectCircle(circle);
    if (!inner.style.color) inner.style.color = currentColor;
  });

  let dragging = false;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;

  const onMove = (ev) => {
    if (!dragging) return;

    const rect = stage.getBoundingClientRect();
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;

    // Move in pixels, then clamp within stage bounds
    const newLeft = startLeft + dx;
    const newTop = startTop + dy;

    const maxLeft = rect.width - circle.offsetWidth;
    const maxTop = rect.height - circle.offsetHeight;

    circle.style.left = `${Math.max(0, Math.min(maxLeft, newLeft))}px`;
    circle.style.top = `${Math.max(0, Math.min(maxTop, newTop))}px`;
  };

  const onUp = () => {
    dragging = false;
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  };

  handle.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    selectCircle(circle);

    const circleRect = circle.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    dragging = true;
    startX = ev.clientX;
    startY = ev.clientY;

    // current position relative to stage (in px)
    startLeft = circleRect.left - stageRect.left;
    startTop = circleRect.top - stageRect.top;

    // convert to px positioning for smoother dragging
    circle.style.left = `${startLeft}px`;
    circle.style.top = `${startTop}px`;

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });
}

// Wire existing circles
document.querySelectorAll(".circle").forEach(wireCircle);

// --- Keyboard shortcut: delete clears selected circle text ---
document.addEventListener("keydown", (e) => {
  if (!selectedCircle) return;

  // If they're typing in the editable area, don't hijack their delete key
  const active = document.activeElement;
  const isEditing = active && active.classList && active.classList.contains("circle-inner");
  if (isEditing) return;

  if (e.key === "Delete" || e.key === "Backspace") {
    selectedCircle.querySelector(".circle-inner").innerText = "";
  }
});
