import { categories, loadLocal, saveLocal } from "../../model.js";

const storageKey = "basic:v1";
const homeSizes = ["Studio", "1 bed", "2 beds", "3 beds"];
const householdSizes = ["1", "2", "3", "4+"];
const defaults = { bedrooms: 1, people: 2, kids: false, pets: false, checked: [] };
const roomNames = new Map(categories.map(({ id, name }) => [id, name]));
const roomIcons = {
  living: '<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M5 11a2 2 0 0 0-3 2v4h20v-4a2 2 0 0 0-4 0v1H6v-1a2 2 0 0 0-1-2ZM5 17v2m14-2v2"/>',
  kitchen: '<path d="M4 13h16l-2 6H6l-2-6Zm0 0H2m18 0h2M4 10h16M9 10V8h6v2"/>',
  bedroom: '<path d="M3 19V6m18 13v-5a3 3 0 0 0-3-3H9v6M3 17h18M3 11h3a3 3 0 0 1 3 3"/>',
  bathroom: '<path d="M2 12h20m-2 0v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3m2 0V6a3 3 0 0 1 6 0v1M7 19l-1 2m11-2 1 2"/>',
};

function getRooms({ bedrooms, people, kids, pets }) {
  const sleepingRooms = Math.max(1, bedrooms);
  const placeSettings = Math.max(2, people);
  return [
    { id: "living", items: [
      ["sofa", bedrooms === 0 ? "Compact sofa" : "Sofa", 1],
      ["lamp", "Lamp", 1],
      ["table", bedrooms === 0 ? "Side table" : "Coffee table", 1],
      ["curtains", "Curtain set", 1],
      ...(kids ? [["toy-bin", "Toy storage bin", 1]] : []),
      ...(pets ? [["pet-bed", "Pet bed", 1]] : []),
    ] },
    { id: "kitchen", items: [
      ["cookware", "Pots & pans set", 1],
      ["dishes", "Plate & bowl set", placeSettings],
      ["cutlery", "Cutlery place setting", placeSettings],
      ["glasses", "Drinking glass", placeSettings],
      ...(pets ? [["pet-bowls", "Pet food & water bowl set", 1]] : []),
    ] },
    { id: "bedroom", items: [
      ["mattress", "Mattress", sleepingRooms],
      ["sheets", "Sheet set", sleepingRooms * 2],
      ["pillow", "Pillow", Math.max(people, sleepingRooms)],
      ["blanket", "Blanket", sleepingRooms],
      ...(kids ? [["night-light", "Night light", 1]] : []),
    ] },
    { id: "bathroom", items: [
      ["towels", "Bath towel", people * 2],
      ["bath-mat", "Bath mat", 1],
      ["soap", "Hand soap", 1],
      ["toilet-brush", "Toilet brush", 1],
      ...(kids ? [["step-stool", "Step stool", 1]] : []),
    ] },
  ];
}

function isValid(state) {
  return state !== null && typeof state === "object"
    && Number.isInteger(state.bedrooms) && state.bedrooms >= 0 && state.bedrooms < homeSizes.length
    && Number.isInteger(state.people) && state.people >= 1 && state.people <= householdSizes.length
    && typeof state.kids === "boolean" && typeof state.pets === "boolean"
    && Array.isArray(state.checked) && state.checked.every((id) => typeof id === "string");
}

function option(name, value, label, selected) {
  return `<label class="choice">
    <input type="radio" name="${name}" value="${value}"${selected ? " checked" : ""}>
    <span>${label}</span>
  </label>`;
}

export function mount(root) {
  const { value, error } = loadLocal(storageKey, defaults, isValid);
  const state = { ...value, checked: new Set(value.checked) };
  root.classList.add("yuva-basic");
  root.innerHTML = `
    <div class="page">
      <header class="masthead">
        <div class="wordmark">
          <svg width="31" height="31" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="currentColor"/>
            <path d="M9 15.5 16 9l7 6.5V23h-5v-5h-4v5H9Z" fill="none" stroke="#fffdf5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Yuva
        </div>
        <span class="masthead-label">The move-in checklist</span>
      </header>
      <main>
        <section class="intro" aria-labelledby="basic-title">
          <div>
            <p class="eyebrow"><span aria-hidden="true"></span> The essentials</p>
            <h1 id="basic-title">Make yourself <em>at home.</em></h1>
            <p class="intro-copy">A room-by-room checklist for settling into your new place.</p>
          </div>
          <svg class="key-art" viewBox="0 0 214 126" fill="none" aria-hidden="true">
            <path d="M169 37c15 8 21 29 9 44-12 16-40 23-63 25-35 3-68-4-79-19-14-19 10-35 30-42 38-15 80-19 103-8Z" fill="#ecebd7"/>
            <path d="M128 46c1-10 14-21 25-16 7 3 8 10 5 15-3 5-11 7-16 3" stroke="#616745" stroke-width="1.6" stroke-linecap="round"/>
            <path d="m122 45 37 10 9 14-12 36-36-12 10-27-12-10c-4-4-1-10 4-11Z" fill="#e7c7ae" stroke="#9e684e" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="127" cy="53" r="2.5" stroke="#9e684e" stroke-width="1.4"/>
            <path d="m147 65 9 3m-12 4 13 4m-10 4 7 2" stroke="#9e684e" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M119 49a19 19 0 1 1-35 6L53 72l-3 9 8 2 7-4 7 2 4-6 7 1 10-6a19 19 0 0 1 26-21Z" fill="#cbd0a9" stroke="#616745" stroke-width="1.6" stroke-linejoin="round"/>
            <circle cx="109" cy="57" r="4.5" stroke="#616745" stroke-width="1.5"/>
            <path d="m60 75 29-16m-9-24v-9m-4 4h8m104 23v-10m-5 5h10M31 63v-6m-3 3h6" stroke="#616745" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
        </section>
        <div class="workspace">
          <section class="setup" aria-labelledby="basic-setup-title">
            <h2 id="basic-setup-title">Your setup</h2>
            <p class="setup-copy">A few details shape your checklist.</p>
            <div class="setup-fields">
              <fieldset>
                <legend>Home size</legend>
                <div class="choices">${homeSizes.map((label, index) =>
                  option("bedrooms", index, label, index === state.bedrooms)).join("")}</div>
              </fieldset>
              <fieldset>
                <legend>People at home</legend>
                <div class="choices">${householdSizes.map((label, index) =>
                  option("people", index + 1, label, index + 1 === state.people)).join("")}</div>
              </fieldset>
              <fieldset>
                <legend>Kids &amp; pets <span class="optional">Optional</span></legend>
                <div class="extras">
                  <label><input type="checkbox" name="kids"${state.kids ? " checked" : ""}> Kids</label>
                  <label><input type="checkbox" name="pets"${state.pets ? " checked" : ""}> Pets</label>
                </div>
              </fieldset>
            </div>
            <p class="setup-note">
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 2v4m0 8v4M2 10h4m8 0h4M4.3 4.3l2.8 2.8m5.8 5.8 2.8 2.8m0-11.4-2.8 2.8m-5.8 5.8-2.8 2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              Your list updates as you make choices.
            </p>
          </section>
          <section class="checklist" aria-labelledby="basic-list-title">
            <div class="list-heading">
              <div>
                <h2 id="basic-list-title">Your checklist</h2>
                <p>Tick off what you already have or pick up.</p>
              </div>
              <p class="progress-label" role="status"></p>
            </div>
            <div class="room-grid"></div>
          </section>
        </div>
        <p class="storage-message" role="status"></p>
      </main>
    </div>`;

  const roomGrid = root.querySelector(".room-grid");
  const progress = root.querySelector(".progress-label");
  const storageMessage = root.querySelector(".storage-message");
  let rooms = getRooms(state);
  storageMessage.textContent = error;

  function showProgress() {
    const items = rooms.flatMap(({ items }) => items);
    const done = items.filter(([id]) => state.checked.has(id)).length;
    progress.textContent = `${done} of ${items.length} checked`;
  }

  function showRooms() {
    roomGrid.innerHTML = rooms.map(({ id, items }) => `
      <section class="room room-${id}" aria-labelledby="basic-room-${id}">
        <h3 id="basic-room-${id}">
          <span class="room-icon" aria-hidden="true">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">${roomIcons[id]}</svg>
          </span>
          ${id === "bedroom" && state.bedrooms !== 1 ? (state.bedrooms === 0 ? "Sleeping area" : "Bedrooms") : roomNames.get(id)}
        </h3>
        <ul>${items.map(([itemId, name, qty]) => `
          <li><label class="item">
            <input type="checkbox" value="${itemId}"${state.checked.has(itemId) ? " checked" : ""}>
            <span class="item-name">${name.replaceAll("&", "&amp;")}</span>
            <span class="quantity" aria-label="Quantity: ${qty}">×${qty}</span>
          </label></li>`).join("")}</ul>
      </section>`).join("");
    showProgress();
  }

  function persist() {
    storageMessage.textContent = saveLocal(storageKey, { ...state, checked: [...state.checked] });
  }

  root.querySelector(".setup-fields").addEventListener("change", ({ target }) => {
    const name = target.name;
    state[name] = target.type === "checkbox" ? target.checked : Number(target.value);
    rooms = getRooms(state);
    const relevant = new Set(rooms.flatMap(({ items }) => items.map(([id]) => id)));
    state.checked = new Set([...state.checked].filter((id) => relevant.has(id)));
    showRooms();
    persist();
  });

  roomGrid.addEventListener("change", ({ target }) => {
    if (target.checked) state.checked.add(target.value);
    else state.checked.delete(target.value);
    showProgress();
    persist();
  });

  showRooms();
}
