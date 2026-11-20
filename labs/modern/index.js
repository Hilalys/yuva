import { categories, seedItems, statuses, priorities, totals, money, loadLocal, saveLocal } from "../../model.js";
import { houseMarkup, connectHouse, roomNumbers } from "./house.js";

const storageKey = "modern:workspace";
const maxMoney = 99999999;
const validAmount = value => Number.isFinite(value) && value >= 0 && value <= maxMoney;
const validItem = item => item && typeof item.id === "string" && typeof item.name === "string"
  && categories.some(cat => cat.id === item.cat) && Object.hasOwn(statuses, item.status)
  && Object.hasOwn(priorities, item.pri) && Number.isSafeInteger(item.qty) && item.qty > 0 && item.qty <= 999
  && (item.price === null || validAmount(item.price));
const validWorkspace = value => value && (value.budget === null || validAmount(value.budget))
  && Array.isArray(value.items) && value.items.every(validItem)
  && new Set(value.items.map(item => item.id)).size === value.items.length;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
const options = (entries, selected) => entries.map(([value, name]) =>
  `<option value="${escape(value)}"${value === selected ? " selected" : ""}>${escape(name)}</option>`).join("");
const catOptions = categories.map(cat => [cat.id, cat.name]);
const statusOptions = Object.entries(statuses);
const icon = (path, size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const plus = icon('<path d="M12 5v14M5 12h14"/>');
const searchIcon = icon('<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 4 4"/>');
const arrow = icon('<path d="M5 12h14m-5-5 5 5-5 5"/>');
const logo = icon('<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10m4-8v4"/>', 23);

function rowMarkup(item) {
  const name = escape(item.name);
  return `<li class="item">
    <span class="item-mark" aria-hidden="true">${item.status === "todo" ? "" : "✓"}</span>
    <div class="item-desc">
      <strong>${name}${item.qty > 1 ? ` <small>×${item.qty}</small>` : ""}</strong>
      <span>${priorities[item.pri]}${item.sub && item.sub !== "Other" ? ` <i>·</i> ${escape(item.sub)}` : ""}</span>
    </div>
    <label class="price">
      <span aria-hidden="true">$</span>
      <input type="number" inputmode="decimal" min="0" max="${maxMoney}" step="0.01" value="${item.price ?? ""}" placeholder="—" aria-label="Estimated price per unit for ${name}" title="Estimated price per unit">
    </label>
    <select class="item-status" aria-label="Status for ${name}">${options(statusOptions, item.status)}</select>
  </li>`;
}

export function mount(root) {
  const { value: state, error } = loadLocal(storageKey, { items: seedItems(), budget: 3500 }, validWorkspace);
  root.classList.add("yuva-modern");
  root.innerHTML = `
    <header class="masthead">
      <div class="frame masthead-inner">
        <div class="identity"><span class="brand-mark">${logo}</span><strong>Yuva</strong><span class="brand-note">Move-in planner</span></div>
        <a class="header-link" href="#ym-budget">Budget ${arrow}</a>
      </div>
    </header>
    <main class="frame workspace">
      <section class="intro" aria-labelledby="ym-title">
        <div><h1 id="ym-title">Your move-in plan</h1>
        <p>See what you have and what you still need, room by room.</p></div>
        <div class="overall">
          <div class="overall-heading">
            <div class="eyebrow">Move-in progress</div>
            <div class="overall-value"><strong data-text="done"></strong> <span data-text="of"></span></div>
          </div>
          <progress aria-label="Move-in progress"></progress>
        </div>
      </section>
      <p class="storage-notice" role="status" hidden></p>
      <div class="desk">
        <section class="plan" aria-labelledby="ym-plan">
          <div class="plan-head">
            <div><h2 id="ym-plan">Floor plan</h2><p class="plan-hint">Select a room to filter the checklist.</p></div>
            <span class="plan-count">9 rooms</span>
          </div>
          <figure class="plan-figure">
            <div class="plot">${houseMarkup()}</div>
            <figcaption class="plan-key">
              <span><i class="solid"></i> Bought or already ours</span><span><i class="outline"></i> Still to get</span>
              <a class="jump-list" href="#ym-checklist">Go to checklist ${arrow}</a>
            </figcaption>
          </figure>
          <section class="budget" id="ym-budget" aria-labelledby="ym-budget-title">
            <div class="budget-head">
              <div><h3 id="ym-budget-title" class="eyebrow">Move-in budget</h3>
                <p><strong data-text="planned"></strong> <span>planned</span></p></div>
              <label class="budget-label"><span id="ym-limit-label">Budget limit</span>
                <span class="price"><span aria-hidden="true">$</span><input id="ym-limit" aria-labelledby="ym-limit-label" type="number" inputmode="decimal" min="0" max="${maxMoney}" step="0.01" placeholder="Set amount" value="${state.budget ?? ""}"></span>
              </label>
            </div>
            <div class="budget-meter" role="img"><i class="spent"></i><i class="remaining"></i><i class="over"></i></div>
            <div class="budget-note"><span data-text="spent"></span><span data-text="to-buy"></span><span data-text="balance"></span></div>
          </section>
        </section>
        <section class="checklist" id="ym-checklist" aria-labelledby="ym-list-title">
          <div class="list-head">
            <h2 id="ym-list-title">Checklist</h2>
            <button type="button" class="primary add-item">${plus} Add item</button>
          </div>
          <div class="filters">
            <label class="search">${searchIcon}<input type="search" aria-label="Search items" placeholder="Search items…"></label>
            <div class="selects">
              <select id="ym-room" aria-label="Filter by room or category" title="Tap a room in the plan to filter">${options([["", "All rooms & categories"], ...catOptions])}</select>
              <select id="ym-status" aria-label="Filter by status">${options([["", "All statuses"], ...statusOptions])}</select>
            </div>
          </div>
          <div class="list-meta"><span class="item-count" role="status"></span><span>Estimated price / unit</span></div>
          <div class="rows" id="ym-rows" tabindex="0" role="region" aria-label="Room checklist">
            <div class="empty" hidden><h3>No matching items</h3><p>Try another search or clear the filters.</p><button type="button" class="clear-filters">Clear filters</button></div>
          </div>
        </section>
      </div>
    </main>
    <dialog aria-labelledby="ym-add-title">
      <form class="add-form">
        <div class="dialog-head"><h2 id="ym-add-title">Add an item</h2>
          <button type="button" class="close-dialog" aria-label="Close">${icon('<path d="m6 6 12 12M18 6 6 18"/>')}</button></div>
        <label>Item name<input name="name" required maxlength="120" autofocus placeholder="e.g. Reading lamp"></label>
        <label><span id="ym-new-cat-label">Room or category</span><select name="cat" aria-labelledby="ym-new-cat-label">${options(catOptions)}</select></label>
        <div class="form-pair">
          <label>Quantity<input name="qty" type="number" inputmode="numeric" min="1" max="999" value="1" required></label>
          <label>Estimated price per unit<input name="price" type="number" inputmode="decimal" min="0" max="${maxMoney}" step="0.01" placeholder="$"></label>
          <label><span id="ym-new-priority-label">Priority</span><select name="pri" aria-labelledby="ym-new-priority-label">${options(Object.entries(priorities))}</select></label>
          <label><span id="ym-new-status-label">Status</span><select name="status" aria-labelledby="ym-new-status-label">${options(statusOptions)}</select></label>
        </div>
        <div class="dialog-actions"><button type="button" class="cancel-dialog">Cancel</button><button type="submit" class="primary">Save item</button></div>
      </form>
    </dialog>`;

  const $ = selector => root.querySelector(selector);
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  const rows = $(".rows");
  const notice = $(".storage-notice");
  const search = $(".search input");
  const statusFilter = $("#ym-status");
  const roomFilter = $("#ym-room");
  const limit = $("#ym-limit");
  const dialog = $("dialog");
  const form = $(".add-form");
  const groups = new Map();
  const itemRows = new Map();

  function showNotice(message) {
    notice.textContent = message;
    notice.hidden = !message;
  }
  showNotice(error);
  function save() {
    showNotice(saveLocal(storageKey, state));
  }

  function appendRow(item) {
    const list = groups.get(item.cat).querySelector("ul");
    list.insertAdjacentHTML("beforeend", rowMarkup(item));
    const row = list.lastElementChild;
    itemRows.set(item.id, row);
    row.querySelector(".price input").addEventListener("change", ({ target }) => {
      if (!target.validity.valid) {
        target.value = item.price ?? "";
        showNotice("Enter a nonnegative estimated price with up to two decimal places.");
        return;
      }
      item.price = target.value === "" ? null : target.valueAsNumber;
      item.est = item.price !== null;
      save();
      refresh();
    });
    row.querySelector("select").addEventListener("change", ({ target }) => {
      item.status = target.value;
      save();
      refresh();
      if (row.hidden && target === doc.activeElement) statusFilter.focus();
    });
  }

  for (const cat of categories) {
    const group = doc.createElement("section");
    group.className = "group";
    group.style.setProperty("--room-color", cat.color);
    group.innerHTML = `<div class="group-head">
      <span class="group-id" aria-hidden="true">${cat.isRoom ? roomNumbers[cat.id] : "＋"}</span>
      <div><h3>${cat.name}</h3><p class="group-count"></p></div>
      <span class="group-total"></span>
    </div><ul></ul>`;
    rows.append(group);
    groups.set(cat.id, group);
  }
  state.items.forEach(appendRow);

  const updateHouse = connectHouse(root, room => {
    roomFilter.value = roomFilter.value === room ? "" : room;
    refreshFilters();
  });
  const text = (key, value) => { $(`[data-text="${key}"]`).textContent = value; };

  function refresh() {
    const total = totals(state.items);
    const budget = state.budget;
    const scale = Math.max(budget ?? 0, total.planned, 1);
    const within = budget ?? total.planned;
    const spentWithin = Math.min(within, total.spent);
    const remaining = Math.min(Math.max(0, within - spentWithin), total.toBuy);
    const over = Math.max(0, total.planned - within);
    const balance = budget === null ? "" : over ? `${money(over)} over budget` : `${money(budget - total.planned)} left`;
    const meter = $(".budget-meter");
    for (const [kind, value] of [["spent", spentWithin], ["remaining", remaining], ["over", over]]) {
      meter.querySelector(`.${kind}`).style.width = `${value / scale * 100}%`;
    }
    meter.setAttribute("aria-label", `${money(total.spent)} bought, ${money(total.toBuy)} still to buy. ${budget === null ? "No budget limit set." : `Budget limit ${money(budget)}. ${balance}.`}`);
    text("done", total.done);
    text("of", `of ${state.items.length} checked off`);
    const progress = $(".overall progress");
    progress.max = state.items.length || 1;
    progress.value = total.done;
    text("planned", money(total.planned));
    text("spent", `${money(total.spent)} bought`);
    text("to-buy", `${money(total.toBuy)} to buy`);
    text("balance", balance || "No limit set");
    $(".budget-note").classList.toggle("over-budget", over > 0);

    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const [cat, group] of groups) {
      const items = state.items.filter(item => item.cat === cat);
      const groupTotal = totals(items);
      let shown = 0;
      for (const item of items) {
        const row = itemRows.get(item.id);
        const matches = (!roomFilter.value || roomFilter.value === cat)
          && (!statusFilter.value || statusFilter.value === item.status)
          && (!query || `${item.name} ${item.note ?? ""} ${item.store ?? ""}`.toLocaleLowerCase().includes(query));
        row.hidden = !matches;
        if (matches) shown++;
        row.dataset.status = item.status;
        row.querySelector(".item-mark").textContent = item.status === "todo" ? "" : "✓";
      }
      group.hidden = !shown;
      group.querySelector(".group-count").textContent = `${groupTotal.done} of ${items.length} checked off`;
      group.querySelector(".group-total").textContent = groupTotal.priced ? `${money(groupTotal.planned)} planned` : "No prices yet";
      visible += shown;
    }
    $(".item-count").textContent = `Showing ${visible} of ${state.items.length} items`;
    $(".empty").hidden = visible !== 0;
    const category = categories.find(cat => cat.id === roomFilter.value);
    $("#ym-plan").textContent = category?.isRoom ? category.name : "Floor plan";
    updateHouse(roomFilter.value, state.items);
  }

  function refreshFilters() {
    rows.scrollTop = 0;
    refresh();
  }
  search.addEventListener("input", refreshFilters);
  roomFilter.addEventListener("change", refreshFilters);
  statusFilter.addEventListener("change", refreshFilters);
  $(".clear-filters").addEventListener("click", () => {
    search.value = roomFilter.value = statusFilter.value = "";
    refreshFilters();
    search.focus();
  });
  limit.addEventListener("change", () => {
    if (!limit.validity.valid) {
      limit.value = state.budget ?? "";
      showNotice("Enter a nonnegative budget limit with up to two decimal places.");
      return;
    }
    state.budget = limit.value === "" ? null : limit.valueAsNumber;
    save();
    refresh();
  });
  $(".add-item").addEventListener("click", () => {
    form.reset();
    form.elements.name.setCustomValidity("");
    form.elements.cat.value = roomFilter.value || categories[0].id;
    dialog.showModal();
  });
  for (const selector of [".close-dialog", ".cancel-dialog"]) $(selector).addEventListener("click", () => dialog.close());
  form.elements.name.addEventListener("input", event => event.target.setCustomValidity(""));
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new win.FormData(form);
    const name = data.get("name").trim();
    if (!name) {
      form.elements.name.setCustomValidity("Enter an item name.");
      form.elements.name.reportValidity();
      return;
    }
    const price = data.get("price") === "" ? null : Number(data.get("price"));
    const item = {
      id: win.crypto.randomUUID(), name, cat: data.get("cat"), sub: "Other", qty: Number(data.get("qty")),
      price, est: price !== null, pri: Number(data.get("pri")), status: data.get("status"), fk: null,
      note: "", store: "", link: "", fav: false,
    };
    state.items.push(item);
    appendRow(item);
    save();
    search.value = statusFilter.value = "";
    roomFilter.value = item.cat;
    refreshFilters();
    dialog.close();
    itemRows.get(item.id).scrollIntoView({ block: "nearest" });
  });
  refresh();
}
