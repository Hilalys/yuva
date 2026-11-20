import { categories } from "../../model.js";

const plans = {
  bedroom: [0, 0, 11, 11, 5, 9.2],
  bathroom: [11, 0, 18, 7, 15, 5.2],
  laundry: [11, 7, 18, 11, 15.6, 9.8],
  kitchen: [18, 0, 28, 9, 24.9, 4.5],
  office: [0, 11, 8, 22, 3.7, 19.8],
  dining: [18, 9, 28, 15, 25.9, 12.5],
  living: [8, 11, 18, 22, 13.2, 17.1],
  entry: [18, 15, 28, 22, 24.5, 19.7],
  balcony: [8, 22, 18, 26, 13.6, 24.8],
};
const wood = "var(--iso-wood)", white = "var(--iso-wall)";
const metal = "var(--iso-metal)", dark = "var(--iso-dark)";
const linen = "var(--iso-linen)", blue = "var(--iso-fabric)";
const pot = "var(--iso-pot)", plant = "var(--iso-plant)", shade = "var(--iso-shade)";
const rug = (x, y, w, d, color) => [x, y, 0, w, d, .08, color];
const table = (x, y, w, d) => [
  ...[x + .16, x + w - .45].flatMap(a =>
    [y + .16, y + d - .45].map(b => [a,b,0,.29,.29,1.7,wood])),
  [x,y,1.7,w,d,.38,wood],
];
const chair = (x, y) => [[x,y,0,1.05,1,1.15,dark], [x,y+.8,1.15,1.05,.2,1.05,dark]];
const planter = (x,y) => [[x,y,0,.85,.85,.75,pot], [x-.12,y-.12,.75,1.09,1.09,.95,plant]];
const lamp = (x,y,z=0,h=2.7) => [[x,y,z,.66,.66,.12,metal],
  [x+.25,y+.25,z+.12,.16,.16,h,dark], [x-.05,y-.05,z+h,.76,.76,.72,shade]];
const pieces = {
  bedroom: {
    bedrug: [rug(2.2,5.6,6.6,4.6,"#7c8cff")],
    bed: [[3,1,0,5,6.4,.6,wood], [3,.65,0,5,.35,2.4,wood],
      [3.15,1.1,.6,4.7,6.2,.55,linen], [3.45,1.35,1.15,1.85,1.2,.32,white],
      [5.65,1.35,1.15,1.85,1.2,.32,white], [3.12,3,1.15,4.76,4.35,.2,"#ff9ec7"],
      [3.12,3,1.35,4.76,.55,.09,"#ffe0ed"]],
    nightstand: [[1.55,1.1,0,1.2,1.1,1.15,wood],[8.25,1.1,0,1.2,1.1,1.15,wood]],
    bedlamp: [...lamp(1.82,1.32,1.15,.42), ...lamp(8.52,1.32,1.15,.42)],
    dresser: [[.7,5.9,0,1.25,3.55,2.1,wood]],
  },
  bathroom: {
    fixed: [[11.7,.7,0,5.6,2.45,1.2,white],[12,.98,1.2,5,1.89,.04,"var(--iso-water)"],
      [11.7,4.1,0,1.45,2,1.5,white],[11.94,4.48,1.5,.95,1.24,.04,"var(--iso-water)"],
      [16.2,3.65,0,1.1,.55,1.55,white],[16.27,4.2,0,.96,1.1,.78,white]],
    bathmat: [rug(13.45,3.7,2.2,1.1,"#ff8fb1")],
  },
  laundry: {
    fixed: [[11.7,7.65,0,1.75,1.55,1.85,white],[13.62,7.65,0,1.75,1.55,1.85,white],
      [12.01,9.20,.53,1.1,.06,.93,metal],[13.93,9.20,.53,1.1,.06,.93,metal]],
    hamper: [[16.1,7.85,0,1.25,1.25,1.35,wood]],
  },
  kitchen: {
    kitchenrug: [rug(18.9,3.35,4.9,1.22,blue)],
    fixed: [[18.65,.65,0,2.65,1.8,1.9,white],[21.3,.65,0,1.85,1.8,1.9,dark],
      [23.15,.65,0,1.8,1.8,1.9,white],[25.35,.65,0,2,1.95,4.2,metal],
      [18.65,.65,1.9,2.65,1.8,.18,dark],[23.15,.65,1.9,1.8,1.8,.18,dark],
      [23.46,1.02,2.08,1.18,1.03,.04,"var(--iso-water)"],
      [20.4,6,0,5.2,1.6,1.65,white],[20.26,5.86,1.65,5.48,1.88,.18,dark]],
    espresso: [[18.93,.89,2.08,1.18,1.13,1.14,metal],[19.17,2.02,2.3,.72,.07,.48,dark]],
    grinder: [[20.4,.99,2.08,.54,.56,1.22,dark]],
    caydanlik: [[21.75,1.09,1.9,.92,.89,.52,"#e5484d"],[21.9,1.22,2.42,.62,.62,.5,"#e5484d"]],
  },
  dining: {
    stools: [...chair(20.3,9.4), ...chair(23.8,9.4)],
    diningtable: table(20.45,10.75,4.85,2.25),
    diningchairs: [...chair(21.3,13.3), ...chair(23.4,13.3)],
  },
  office: {
    chairmat: [rug(3.2,12.9,2.14,2.55,metal),rug(3.2,16.9,2.14,2.55,metal)],
    desk: [...table(.75,11.9,2.35,3.85), ...table(.75,15.95,2.35,3.85)],
    monitor: [12.85,16.95].flatMap(y => [[1.16,y+.6,2.08,.55,.5,.5,metal],[1,y,2.58,.22,1.72,.92,dark]]),
    officechair: [...chair(3.7,13.65), ...chair(3.7,17.55)],
  },
  living: {
    rug: [rug(9.9,14,7.1,5.5,"#ff6f59")],
    bookshelf: [[8.65,12,0,.95,2.75,3.55,wood]],
    tvstand: [[11.5,11.75,0,4.3,1.15,1.05,wood]],
    tv: [[13.4,12.13,1.05,.45,.45,.4,metal],[11.94,12.1,1.45,3.36,.3,1.58,dark]],
    plants: planter(16.52,12.15),
    coffeetable: [[12.2,15,0,2.85,1.75,.92,wood],[12.1,14.9,.92,3.05,1.95,.22,wood]],
    sofa: [[9,14.4,0,2.1,4.7,.93,blue],[9,19.1,0,7.45,2.18,.93,blue],
      [9,14.4,.93,.52,4.7,1.12,blue],[9,20.72,.93,7.45,.56,1.12,blue],
      [15.91,19.1,.93,.54,1.62,.66,blue],[9.52,19.17,.93,2.95,1.53,.2,"#7994ff"],
      [12.47,19.17,.93,3.44,1.53,.2,"#7994ff"]],
    floorlamp: lamp(16.78,19.24),
  },
  entry: {
    hallrunner: [rug(20.2,17.6,6.4,1.4,"#7c8cff")],
    doormat: [rug(22,20,2.75,1.3,"#9b7653")],
    shoecabinet: [[22.8,15.72,0,4,1.15,1.65,wood]],
    coatrack: [[18.8,15.9,0,.65,.65,.12,dark],[19.04,16.14,.12,.17,.17,3.5,wood],
      [18.8,15.98,1.9,.65,.6,1.35,"#ffb547"]],
    umbrella: [[19.92,16.53,0,.72,.72,1.53,dark]],
  },
  balcony: {
    outdoorrug: [rug(9.4,22.64,5.85,2.3,"#2ec4b6")],
    balconychairs: [...chair(9.75,22.75),...chair(13.72,22.75)],
    balconytable: table(11.62,22.6,1.34,1.16),
    planters: planter(16.3,23.14),
  },
};

const view = [-216, -48, 480, 316];
const iso = (x, y, z) => [(x - y) * 8.66, (x + y) * 4.62 - z * 10];
const points = vertices => vertices.map(vertex => iso(...vertex).map(n => n.toFixed(2)).join(",")).join(" ");
const face = (kind, vertices) => `<polygon class="${kind}" points="${points(vertices)}"/>`;
function box([x,y,z,w,d,h,fill], elevation = 0, sides = fill) {
  const X = x+w, Y = y+d, Z = z+elevation+h;
  z += elevation;
  return `<g style="--top:${fill};--side:${sides}">
    ${face("front", [[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]])}
    ${face("right", [[X,y,z],[X,Y,z],[X,Y,Z],[X,y,Z]])}
    ${face("top", [[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]])}</g>`;
}

export function mountHouse(model, toggle) {
  const names = new Map(categories.filter(cat => cat.isRoom).map(cat => [cat.id, cat]));
  const rooms = Object.entries(plans);
  const height = id => id === "balcony" ? .48 : .82;
  const roomMarkup = rooms.map(([id,[x,y,X,Y]], i) => {
    const color = names.get(id).color;
    const h = height(id);
    const w = X-x-.46, d = Y-y-.46;
    x += .23;
    y += .23;
    const walls = id === "balcony" ? "" :
      box([x,y,0,w,.29,2.1,white], h, "var(--iso-wall-side)") +
      box([x,y+.29,0,.29,d-.29,2.1,white], h, "var(--iso-wall-side)");
    const furniture = Object.entries(pieces[id]).sort((a,b) => {
      const depth = ([,shapes]) => {
        const [px,py,,pw,pd,ph] = shapes[0];
        return ph < .1 ? -1 : px+py+(pw+pd)/2;
      };
      return depth(a)-depth(b);
    }).map(([key, shapes]) => `<g ${key === "fixed" ? "" : `data-fk="${key}" class="piece"`}>
      ${shapes.map(shape => box(shape,h)).join("")}</g>`).join("");
    const railing = id === "balcony" ? [x,x+w/3,x+w*2/3,x+w-.1].map(a =>
      box([a,y+d-.12,0,.1,.1,1.17,white],h)).join("") +
      box([x,y+d-.12,1.17,w,.12,.12,white],h) : "";

    return `<g class="iso-room" data-room="${id}" style="--i:${i}">
      <polygon class="iso-shadow" transform="translate(5 6)" points="${points([[x,y,0],[x+w,y,0],[x+w,y+d,0],[x,y+d,0]])}"/>
      ${box([x,y,0,w,d,h,color])}${walls}${furniture}${railing}</g>`;
  });
  model.innerHTML = `<svg class="house-svg" viewBox="${view.join(" ")}" aria-hidden="true">${roomMarkup.join("")}</svg>
    ${rooms.map(([id,[,,,,lx,ly]]) => {
      const [x,y] = iso(lx,ly,height(id));
      const { name, color } = names.get(id);
      return `<button type="button" class="map-label" data-map="${id}" aria-pressed="false"
        style="--c:${color};--x:${(x-view[0])/view[2]*100}%;--y:${(y-view[1])/view[3]*100}%">
        <i></i>${name}<span></span></button>`;
    }).join("")}`;
  model.addEventListener("click", event => {
    const id = event.target.closest("[data-map]")?.dataset.map ??
      event.target.closest("[data-room]")?.dataset.room;
    if (id) toggle(id);
  });
  let first = true;
  return (selected, items) => {
    const owned = new Set(items.filter(item => item.status !== "todo").map(item => item.fk));
    model.classList.toggle("has-selection", selected.size > 0);
    for (const room of model.querySelectorAll("[data-room]")) {
      room.classList.toggle("is-selected", selected.has(room.dataset.room));
    }
    for (const button of model.querySelectorAll("[data-map]")) {
      const id = button.dataset.map;
      const count = items.filter(item => item.cat === id).length;
      button.setAttribute("aria-pressed", selected.has(id));
      button.setAttribute("aria-label", `${names.get(id).name}, ${count} items`);
      button.lastElementChild.textContent = count;
    }
    for (const piece of model.querySelectorAll("[data-fk]")) {
      const ghost = !owned.has(piece.dataset.fk);
      const arrives = !first && !ghost && piece.classList.contains("ghost");
      piece.classList.toggle("ghost", ghost);
      if (ghost) piece.classList.remove("drop-in");
      if (arrives) piece.classList.add("drop-in");
    }
    first = false;
  };
}
