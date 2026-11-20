import { categories, seedItems, statuses, priorities, totals, money, loadLocal, saveLocal } from "../../model.js";
import { mountHouse } from "./house.js";

const paths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/>',
  moon: '<path d="M20.5 15a9 9 0 0 1-11.4-11.4A9 9 0 1 0 20.5 15Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const byId = new Map(categories.map(cat => [cat.id, cat]));
const selectedOption = (key, value, label) => `<option value="${key}" ${String(key) === String(value) ? "selected" : ""}>${label}</option>`;
const escape = text => String(text).replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const validAmount = value => Number.isFinite(value) && value >= 0 && value <= 99999999;
const validItems = value => Array.isArray(value) && value.every(item =>
  item && byId.has(item.cat) && Object.hasOwn(statuses, item.status) &&
  Object.hasOwn(priorities, item.pri) && typeof item.id === "string" &&
  typeof item.name === "string" && typeof item.sub === "string" &&
  Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 999 &&
  (item.price === null || validAmount(item.price)));

export function mount(root) {
  const doc = root.ownerDocument;
  const browser = doc.defaultView;
  const saved = loadLocal("classic:items", seedItems(), validItems);
  const savedBudget = loadLocal("classic:budget", 3500, value => value === null || validAmount(value));
  const savedTheme = loadLocal("classic:theme", "light", value => ["light", "dark"].includes(value));
  let items = saved.value;
  let budget = savedBudget.value;
  let status = "all";
  let missingOnly = false;
  const selected = new Set();
  const collapsed = new Set();
  const mark = new URL("./mark.svg", import.meta.url);
  root.classList.add("yuva-classic");
  root.innerHTML = `
    <header class="masthead">
      <div class="mast-inner">
        <div class="brand"><img src="${mark}" width="34" height="34" alt=""><span>Yuva</span></div>
        <span class="mast-caption">The move-in planner</span>
        <div class="top-actions">
          <button type="button" class="button theme" data-theme-button></button>
          <button type="button" class="button primary" data-add>${icon("plus")} Add item</button>
        </div>
      </div>
    </header>
    <main class="sheet">
      <div class="intro">
        <div class="intro-copy">
          <p class="eyebrow"><span class="eyebrow-line"></span> YOUR MOVE-IN PLAN</p>
          <h1>Make it home.</h1>
          <p class="lede">Plan what you need, room by room.</p>
          <p class="price-note">Estimates and your own prices. No live pricing.</p>
        </div>
        <section class="budget paper-card" aria-labelledby="classic-budget-title">
          <div class="budget-top">
            <div class="budget-planned"><h2 class="eyebrow" id="classic-budget-title">BUDGET / PLANNED</h2><strong data-planned></strong></div>
            <label class="budget-label">Budget limit
              <span class="money-field"><span aria-hidden="true">$</span><input data-budget type="number" min="0" max="99999999" step=".01" inputmode="decimal" placeholder="Set limit"></span>
            </label>
          </div>
          <div class="budget-meter" role="img"></div>
          <div class="budget-figures"><span><i class="key bought"></i><b data-spent></b> bought</span>
            <span><i class="key planned"></i><b data-to-buy></b> to buy</span><strong data-balance></strong></div>
        </section>
      </div>
      <p class="storage-warning" role="status" hidden></p>
      <div class="workspace">
        <section class="plan paper-card" aria-labelledby="classic-plan-title">
          <header class="panel-heading">
            <div><p class="eyebrow">01 / FLOOR PLAN</p><h2 id="classic-plan-title">The house</h2></div>
            <span class="panel-hint">Pick a room to filter the list</span>
          </header>
          <div class="drawing">
            <span class="drawing-note" aria-hidden="true">FIG. 01<br>ISOMETRIC STUDY</span>
            <div class="model"></div>
          </div>
          <div class="legend"><span><i class="key solid"></i>Bought or already ours</span><span><i class="key dashed"></i>Still to get</span></div>
          <div class="plan-summary">
            <div class="summary-label"><strong data-summary-title></strong><span data-progress-copy></span></div>
            <progress data-progress aria-label="Items checked off"></progress>
            <a class="jump-to-list" href="#classic-list-title">Go to the checklist ↓</a>
          </div>
        </section>
        <section class="list" aria-labelledby="classic-list-title">
          <header class="panel-heading">
            <div><p class="eyebrow">02 / CHECKLIST</p><h2 id="classic-list-title" tabindex="-1">The list</h2></div>
            <span class="panel-hint" data-count aria-live="polite"></span>
          </header>
          <label class="search">${icon("search")}<span class="sr">Search the checklist</span><input type="search" placeholder="Search items, notes or stores" data-search></label>
          <div class="list-tools">
            <div class="segments" role="group" aria-label="Filter by status">
              <button type="button" data-status-filter="all">All</button>
              ${Object.entries(statuses).map(([id,name]) => `<button type="button" data-status-filter="${id}">${name}</button>`).join("")}
            </div>
            <button type="button" class="button missing" data-missing aria-pressed="false">No price yet</button>
          </div>
          <div class="category-filters">
            <div class="filter-label"><span class="eyebrow" id="classic-category-label">ROOMS &amp; CATEGORIES</span><span>Scroll for more <span aria-hidden="true">→</span></span></div>
            <div class="chips" role="group" aria-labelledby="classic-category-label">
              <button type="button" class="chip" data-cat="all">All</button>
              ${categories.map(cat => `<button type="button" class="chip" data-cat="${cat.id}" style="--c:${cat.color}"><i></i>${cat.name}</button>`).join("")}
            </div>
          </div>
          <div class="results" role="region" aria-label="Checklist items" tabindex="-1"></div>
        </section>
      </div>
    </main>
    <dialog class="add-dialog" aria-labelledby="classic-add-title">
      <form class="add-form">
        <header><p class="eyebrow">CHECKLIST / NEW</p><h2 id="classic-add-title">Add an item</h2></header>
        <div class="form-fields">
          <label class="wide">Item name<input name="name" required maxlength="100" autofocus></label>
          <label class="wide">Room or category
            <select name="cat">${categories.map(cat => selectedOption(cat.id, "", cat.name)).join("")}</select>
          </label>
          <label>Quantity<input name="qty" type="number" value="1" min="1" max="999" required></label>
          <label>Unit price ($)<input name="price" type="number" min="0" max="99999999" step=".01" inputmode="decimal" placeholder="Optional"></label>
          <label>Priority<select name="pri">${Object.entries(priorities).map(([key,label]) => selectedOption(key, 1, label)).join("")}</select></label>
          <label>Status<select name="status">${Object.entries(statuses).map(([key,label]) => selectedOption(key, "todo", label)).join("")}</select></label>
          <label class="estimate"><input type="checkbox" name="est"> Price is estimated</label>
          <label class="wide">Note (optional)<input name="note" maxlength="160"></label>
        </div>
        <footer><button type="button" class="button" data-cancel>Cancel</button><button type="submit" class="button primary">Save item</button></footer>
      </form>
    </dialog>`;

  const get = selector => root.querySelector(selector);
  const search = get("[data-search]");
  const budgetInput = get("[data-budget]");
  const results = get(".results");
  const listTitle = get("#classic-list-title");
  const dialog = get(".add-dialog");
  const form = get(".add-form");
  const warning = get(".storage-warning");
  const theme = get("[data-theme-button]");
  const text = (selector, content) => { get(selector).textContent = content; };
  budgetInput.value = budget ?? "";
  function showWarning(message) {
    if (!message) return;
    warning.textContent = message;
    warning.hidden = false;
  }
  showWarning(saved.error || savedBudget.error || savedTheme.error);
  function applyTheme(value) {
    root.dataset.theme = value;
    theme.innerHTML = icon(value === "dark" ? "sun" : "moon");
    const title = value === "dark" ? "Use light theme" : "Use blueprint theme";
    theme.setAttribute("aria-label", title);
    theme.title = title;
  }
  applyTheme(savedTheme.value);
  theme.addEventListener("click", () => {
    const value = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(value);
    showWarning(saveLocal("classic:theme", value));
  });
  function toggle(id) {
    if (id === "all") selected.clear();
    else if (!selected.delete(id)) {
      selected.add(id);
      collapsed.delete(id);
    }
    renderFilters();
  }
  const updateHouse = mountHouse(get(".model"), id => {
    const listIsAbove = listTitle.getBoundingClientRect().top < 0;
    toggle(id);
    if (listIsAbove) listTitle.scrollIntoView({ block: "start" });
  });

  function renderBudget() {
    const { planned, spent, toBuy } = totals(items);
    const scale = Math.max(planned, budget ?? 0, 1);
    const onBudget = budget ?? planned;
    const over = Math.max(0, planned - onBudget);
    text("[data-planned]", money(planned));
    text("[data-spent]", money(spent));
    text("[data-to-buy]", money(toBuy));
    const balance = get("[data-balance]");
    balance.textContent = budget === null ? "No limit set" : over ? `${money(over)} over` : `${money(onBudget - planned)} left`;
    balance.classList.toggle("over", over > 0);
    const meter = get(".budget-meter");
    meter.innerHTML = [
      ["bought", Math.min(spent, onBudget)],
      ["planned", Math.min(toBuy, Math.max(0, onBudget - spent))],
      ["overage", over],
    ].filter(([,amount]) => amount > 0).map(([key,amount]) =>
      `<span class="${key}" style="width:${amount / scale * 100}%"></span>`).join("");
    meter.setAttribute("aria-label", `${money(spent)} bought, ${money(toBuy)} to buy. ${balance.textContent}.`);
  }

  function renderList() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = items.filter(item =>
      (!selected.size || selected.has(item.cat)) &&
      (status === "all" || status === item.status) &&
      (!missingOnly || (item.price === null && item.status !== "have")) &&
      (!query || [item.name, item.note, item.store, byId.get(item.cat).name]
        .some(value => String(value ?? "").toLocaleLowerCase().includes(query))));
    text("[data-count]", `${visible.length} of ${items.length} items`);
    const active = doc.activeElement;
    const retain = results.contains(active) && active.dataset.act ? active.dataset : null;
    results.innerHTML = categories.map(cat => {
      const current = visible.filter(item => item.cat === cat.id);
      if (!current.length) return "";
      const full = items.filter(item => item.cat === cat.id);
      const { done, planned, priced } = totals(full);
      const open = !collapsed.has(cat.id);
      const sections = [...new Set(current.map(item => item.sub))];
      return `<article class="category" data-group="${cat.id}" style="--c:${cat.color}">
        <header class="category-heading">
          <button type="button" data-act="collapse" data-id="${cat.id}" aria-expanded="${open}" aria-controls="classic-group-${cat.id}">
            <span class="twisty" aria-hidden="true">${open ? "−" : "+"}</span>
            <span class="category-name"><span aria-hidden="true">${cat.emoji}</span> ${cat.name}
              <small class="category-count">${done} of ${full.length} checked off</small></span>
            <span class="category-cost"><b>${priced ? money(planned) : "—"}</b><small>${priced ? "planned" : "no prices"}</small></span>
          </button>
          <div class="category-progress" aria-hidden="true"><i style="width:${done / full.length * 100}%"></i></div>
        </header>
        <div id="classic-group-${cat.id}" ${open ? "" : "hidden"}>
        ${open ? sections.map(sub => `<div class="subcategory">${escape(sub)}</div>
          ${current.filter(item => item.sub === sub).map(row).join("")}`).join("") : ""}</div></article>`;
    }).join("") || `<div class="empty"><h3>No matching items</h3><p>Try a different search or clear the filters.</p>
      <button type="button" class="button" data-act="clear">Clear filters</button></div>`;
    if (retain) {
      const next = [...results.querySelectorAll("[data-act]")].find(node => node.dataset.act === retain.act && node.dataset.id === retain.id);
      (next ?? results).focus({ preventScroll: true });
    }
  }

  function row(item) {
    const id = escape(item.id), name = escape(item.name);
    const state = statuses[item.status];
    return `<div class="item-row">
      <div class="item-main">
        <div class="item-name"><span class="row-marker">${marker(item.status)}</span>
          ${name}${item.qty > 1 ? ` <span class="quantity">×${item.qty}</span>` : ""}</div>
        <div class="tags"><span class="tag priority-${item.pri}">${priorities[item.pri]}</span>
          ${item.est && item.price !== null ? '<span class="tag estimate-tag" title="Estimated unit price">Est.</span>' : ""}</div>
        ${item.note ? `<div class="item-note">${escape(item.note)}</div>` : ""}
      </div>
      <label class="money-field row-price"><span aria-hidden="true">$</span><input type="number" min="0" max="99999999" step=".01"
        inputmode="decimal" placeholder="—" value="${item.price ?? ""}" aria-label="Unit price for ${name}" data-act="price" data-id="${id}"></label>
      <select class="row-status ${item.status}" aria-label="Status for ${name}" data-act="status" data-id="${id}" title="${state}">
        ${Object.entries(statuses).map(([key,label]) => selectedOption(key, item.status, label)).join("")}</select>
    </div>`;
  }

  function marker(value) {
    return value !== "todo" ? `<span class="done-icon ${value}">${icon("check")}</span>` : "";
  }

  function renderFilters() {
    for (const button of root.querySelectorAll("[data-cat]")) {
      const id = button.dataset.cat;
      button.setAttribute("aria-pressed", id === "all" ? !selected.size : selected.has(id));
    }
    for (const button of root.querySelectorAll("[data-status-filter]")) button.setAttribute("aria-pressed", button.dataset.statusFilter === status);
    get("[data-missing]").setAttribute("aria-pressed", missingOnly);
    render();
  }

  function render(patchRow) {
    updateHouse(selected, items);
    const subset = selected.size ? items.filter(item => selected.has(item.cat)) : items;
    const { done } = totals(subset);
    text("[data-summary-title]", selected.size === 1 ? byId.get([...selected][0]).name : selected.size ? "Selected categories" : "The whole home");
    text("[data-progress-copy]", `${done} of ${subset.length} checked off`);
    const progress = get("[data-progress]");
    progress.max = subset.length || 1;
    progress.value = done;
    renderBudget();
    if (patchRow) patchRow();
    else renderList();
  }

  search.addEventListener("input", () => {
    collapsed.clear();
    renderList();
  });
  budgetInput.addEventListener("change", () => {
    if (!budgetInput.reportValidity()) return;
    budget = budgetInput.value === "" ? null : budgetInput.valueAsNumber;
    showWarning(saveLocal("classic:budget", budget));
    renderBudget();
  });
  root.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.cat) toggle(button.dataset.cat);
    if (button.dataset.statusFilter) {
      status = button.dataset.statusFilter;
      renderFilters();
    }
    if (button.hasAttribute("data-missing")) {
      missingOnly = !missingOnly;
      renderFilters();
    }
    if (button.dataset.act === "clear") {
      search.value = "";
      selected.clear();
      status = "all";
      missingOnly = false;
      search.focus();
      renderFilters();
    }
    if (button.dataset.act === "collapse") {
      if (button.getAttribute("aria-expanded") === "true") collapsed.add(button.dataset.id);
      else collapsed.delete(button.dataset.id);
      renderList();
    }
    if (button.hasAttribute("data-add")) {
      form.reset();
      form.elements.name.setCustomValidity("");
      if (selected.size === 1) form.elements.cat.value = [...selected][0];
      dialog.showModal();
    }
    if (button.hasAttribute("data-cancel")) dialog.close();
  });
  results.addEventListener("change", event => {
    const target = event.target;
    const item = items.find(row => row.id === target.dataset.id);
    if (!item) return;
    if (target.dataset.act === "status") item.status = target.value;
    else if (target.dataset.act === "price") {
      if (!target.reportValidity()) return;
      const value = target.value === "" ? null : target.valueAsNumber;
      if (item.price !== value) {
        item.price = value;
        item.est = false;
      }
    } else return;
    showWarning(saveLocal("classic:items", items));
    if ((status !== "all" && status !== item.status) ||
        (missingOnly && (item.price !== null || item.status === "have"))) {
      render();
      return;
    }

    // Keep the native controls mounted while the edited price commits on blur.
    render(() => {
      const rowNode = target.closest(".item-row");
      rowNode.querySelector(".row-marker").innerHTML = marker(item.status);
      if (!item.est) rowNode.querySelector(".estimate-tag")?.remove();
      const select = rowNode.querySelector(".row-status");
      select.className = `row-status ${item.status}`;
      select.title = statuses[item.status];
      const group = target.closest("[data-group]");
      const groupItems = items.filter(row => row.cat === item.cat);
      const { done, planned, priced } = totals(groupItems);
      group.querySelector(".category-count").textContent = `${done} of ${groupItems.length} checked off`;
      group.querySelector(".category-cost b").textContent = priced ? money(planned) : "—";
      group.querySelector(".category-cost small").textContent = priced ? "planned" : "no prices";
      group.querySelector(".category-progress i").style.width = `${done / groupItems.length * 100}%`;
    });
  });
  form.elements.name.addEventListener("input", () => form.elements.name.setCustomValidity(""));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new browser.FormData(form);
    const name = data.get("name").trim();
    if (!name) {
      form.elements.name.setCustomValidity("Enter an item name.");
      form.elements.name.reportValidity();
      return;
    }
    const cat = data.get("cat");
    const price = data.get("price") === "" ? null : Number(data.get("price"));
    const item = {
      id: browser.crypto.randomUUID(), name, cat, sub: "Added items",
      qty: Number(data.get("qty")), price, est: data.has("est") && price !== null,
      pri: Number(data.get("pri")), status: data.get("status"), note: data.get("note").trim(),
      fk: null, fav: false, store: "", link: "",
    };
    items = [item, ...items];
    showWarning(saveLocal("classic:items", items));
    dialog.close();
    selected.clear();
    selected.add(cat);
    collapsed.delete(cat);
    search.value = "";
    status = "all";
    missingOnly = false;
    renderFilters();
    const newRow = results.querySelector(`[data-act="price"][data-id="${item.id}"]`).closest(".item-row");
    newRow.tabIndex = -1;
    newRow.focus({ preventScroll: true });
    newRow.scrollIntoView({ block: "nearest" });
  });
  renderFilters();
}
