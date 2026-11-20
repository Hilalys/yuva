import { categories } from "../../model.js";

const W = 640, H = 356;
const point = (x, y, z = 0) => [292 + (x - y) * 12.5, 37 + (x + y) * 6.45 - z * 12];
const polygon = (points, kind, color = "") =>
  `<polygon class="${kind}" ${color ? `fill="${color}"` : ""} points="${points.map(p => point(...p).join(",")).join(" ")}"/>`;

const box = (x, y, w, d, h, color, z = 0, kind = "") => {
  const X = x + w, Y = y + d, Z = z + h;
  return polygon([[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]], `face front ${kind}`, color)
    + polygon([[X,y,z],[X,Y,z],[X,Y,Z],[X,y,Z]], `face side ${kind}`, color)
    + polygon([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]], `face top ${kind}`, color);
};
const wood = "#b68c64", fabric = "#99a78a", light = "#ebe5d7", metal = "#89948b", clay = "#c68971", ink = "#596a63";
const piece = (id, shapes) => `<g class="piece is-ghost" data-piece="${id}">${shapes.join("")}</g>`;
const rug = (x,y,w,d,color) => box(x,y,w,d,.065,color,0,"textile");
const chair = (x,y,color) => box(x,y,1.05,1.05,1.05,color)
  + box(x,y+.87,1.05,.18,1.05,color,1.05);
const table = (x,y,w,d,h,color) => {
  const legs = [[x,y],[x+w-.21,y],[x,y+d-.21],[x+w-.21,y+d-.21]];
  return legs.map(([a,b]) => box(a,b,.21,.21,h,wood)).join("") + box(x,y,w,d,.22,color,h);
};
const plant = (x,y) => box(x,y,.76,.76,.72,clay)
  + box(x+.13,y+.13,.53,.53,.88,fabric,.72)
  + box(x-.17,y+.28,.5,.5,.43,"#85956e",1)
  + box(x+.45,y-.12,.51,.51,.46,"#a3af7e",.94);
const lamp = (x,y) => box(x,y,.72,.72,.12,ink)
  + box(x+.3,y+.3,.12,.12,2,ink,.12)
  + box(x-.03,y-.03,.78,.78,.65,light,2.1);

// Each room is drawn in depth order. Pins use the same projection as the floors.
const rooms = [
  ["bedroom", "Bedroom", "01", [0,0,9,8], [5.7,6.1], () =>
    piece("bedrug",[rug(2.5,2.6,5.6,4.7,clay)])
    + piece("bed",[
      box(2.8,1.1,4,4.5,.57,wood), box(2.8,.85,4,.27,1.9,wood),
      box(2.96,1.14,3.68,4.3,.57,light,.57), box(2.94,2.58,3.71,2.83,.21,"#aabb9d",1.14),
      box(3.13,1.38,1.46,1,.25,"#faf5e8",1.14), box(4.99,1.38,1.46,1,.25,"#faf5e8",1.14),
    ])
    + piece("nightstand",[box(1.47,1.27,1,1,1,wood),box(7.13,1.27,1,1,1,wood)])
    + piece("bedlamp",[box(1.74,1.52,.46,.46,.7,light,1),box(7.39,1.52,.46,.46,.7,light,1)])
    + piece("dresser",[box(.85,3.25,1.26,2.78,1.6,wood)])],
  ["bathroom", "Bath", "02", [9,0,15,4.8], [12.7,3.88], () =>
    box(9.78,.74,3.35,1.61,.71,light) + box(10,.94,2.91,1.2,.045,"#a3b8b2",.71)
    + box(13.45,1.05,.9,.57,1.17,light) + box(13.5,1.62,.8,.93,.62,light)
    + piece("bathmat",[rug(10.47,2.64,1.96,.79,fabric)])],
  ["office", "Office", "03", [0,8,7.5,17], [5.83,13.43], () =>
    piece("chairmat",[rug(2.68,9.13,2.37,2.56,metal),rug(2.68,13.12,2.37,2.56,metal)])
    + piece("desk",[table(.92,8.94,1.71,6.48,1.66,wood)])
    + piece("monitor",[box(1.28,9.75,.2,1.56,1,ink,1.95),box(1.28,13.09,.2,1.56,1,ink,1.95)])
    + piece("officechair",[chair(3.52,9.6,ink),chair(3.52,13.46,ink)])],
  ["laundry", "Laundry", "04", [9,4.8,15,8], [13.21,6.89], () =>
    box(9.84,5.48,1.21,1.39,1.5,light) + box(11.13,5.48,1.21,1.39,1.5,light)
    + piece("hamper",[box(12.83,5.46,.86,.75,1,wood)])],
  ["kitchen", "Kitchen", "05", [15,0,26,8], [23.49,3.34], () =>
    box(15.85,.75,6.85,1.47,1.55,light) + box(16.05,.86,6.45,1.24,.15,"#a6a99a",1.55)
    + box(20.1,1.01,1.53,.85,.025,ink,1.7)
    + piece("espresso",[box(16.22,1.05,1.12,.93,1.02,metal,1.7)])
    + piece("grinder",[box(17.67,1.13,.53,.63,1.12,ink,1.7)])
    + piece("caydanlik",[box(18.64,1.17,.65,.65,.48,clay,1.7),box(18.75,1.29,.43,.43,.43,clay,2.18)])
    + box(23.69,.75,1.58,1.68,2.88,light)
    + piece("kitchenrug",[rug(16.66,2.77,3.85,.78,fabric)])
    + box(18.71,4.52,4.25,1.53,1.4,wood)
    + box(18.58,4.39,4.51,1.79,.21,light,1.4)],
  ["living", "Living", "06", [7.5,8,17,17], [13.97,13.7], () =>
    piece("rug",[rug(9.6,10.42,5.5,4.65,clay)])
    + piece("bookshelf",[box(8.13,8.86,1.02,2.15,2.17,wood)])
    + piece("tvstand",[box(10.47,8.75,4.36,.98,.85,wood)])
    + piece("tv",[box(11.08,9.02,3.16,.19,1.31,ink,.85)])
    + piece("plants",[plant(15.37,9.28)])
    + piece("coffeetable",[table(11,11.38,2.88,1.62,.8,wood)])
    + piece("sofa",[
      box(8.88,12.41,1.8,3.7,.64,fabric),box(10.68,14.18,4,1.93,.64,fabric),
      box(9.22,12.71,1.36,2.99,.37,"#aebba0",.64),box(10.68,14.32,3.62,1.27,.37,"#aebba0",.64),
      box(8.88,12.07,1.8,.49,.95,fabric,.64),box(14.32,14.18,.36,1.93,.76,fabric,.64),
      box(8.88,15.67,5.8,.51,.93,fabric,.64),
    ])
    + piece("floorlamp",[lamp(15.54,15.74)])],
  ["dining", "Dining", "07", [17,8,26,13.8], [24.32,11.37], () =>
    piece("stools",[box(18.24,8.63,.88,.88,1.21,ink),box(20.02,8.63,.88,.88,1.21,ink)])
    + piece("diningtable",[table(19.2,9.89,3.75,1.9,1.46,wood)])
    + piece("diningchairs",[chair(19.61,12,ink),chair(21.54,12,ink)])],
  ["balcony", "Balcony", "08", [7.5,17,17,21.1], [13.1,19.94], () =>
    piece("outdoorrug",[rug(8.81,17.74,6.89,2.45,fabric)])
    + piece("balconychairs",[chair(9.03,18.19,wood),chair(14.39,18.17,wood)])
    + piece("balconytable",[table(11.26,17.98,1.2,1.06,1.06,light)])
    + piece("planters",[plant(15.78,17.75)])
    + box(7.77,20.78,8.96,.11,.61,"#a2ae9a")],
  ["entry", "Entry", "09", [17,13.8,26,20], [23.61,17.91], () =>
    piece("hallrunner",[rug(18.13,16.56,5.72,1.27,clay)])
    + piece("doormat",[rug(21.48,18.51,2.67,.9,wood)])
    + piece("shoecabinet",[box(20.78,14.42,3.67,1.25,1.43,light),box(20.71,14.37,3.81,1.34,.12,wood,1.43)])
    + piece("coatrack",[box(17.91,14.73,.72,.72,.12,wood),box(18.2,15,.15,.15,2.71,wood,.12),box(18.15,15.13,.54,.34,1.2,clay,1.26)])
    + piece("umbrella",[box(19.19,14.79,.57,.53,.91,ink)])],
];

export const roomNumbers = Object.fromEntries(rooms.map(([id,,number]) => [id, number]));

export function houseMarkup() {
  const floors = rooms.map(([id,,,bounds, , furnish], index) => {
    const [a,b,c,d] = bounds;
    const floor = categories.find(cat => cat.id === id).color;
    const x = a+.15, y = b+.15, w = c-a-.3, depth = d-b-.3;
    const wall = id === "balcony" ? "" :
      box(x,y,w,.18,.88,"#f1ede0") + box(x,y+.18,.18,depth-.18,.88,"#eee9d9");
    const joints = Array.from({length: Math.floor(w/1.26)}, (_, i) => {
      const start = point(x+.35+i*1.26,y), end = point(x+.35+i*1.26,y+depth);
      return `<path class="joint" d="M${start.join(" ")} L${end.join(" ")}"/>`;
    }).join("");
    return `<g class="volume" data-volume="${id}" style="--order:${index}">
      ${box(x,y,w,depth,.46,floor,-.46,"slab")}${joints}${wall}${furnish()}
    </g>`;
  }).join("");
  const pins = rooms.map(([id, short, number,, label]) => {
    const [x,y] = point(...label);
    const name = categories.find(cat => cat.id === id).name;
    return `<button type="button" class="pin" data-room="${id}" style="--x:${x/W*100}%;--y:${y/H*100}%" aria-label="Filter by ${name}" aria-pressed="false" aria-controls="ym-rows"><span>${number}</span><b>${short}</b></button>`;
  }).join("");
  return `<div class="drawing">
    <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <path class="guide" d="M49 172 293 298 624 128 M49 172 292 47 M293 298 293 322 M624 128 624 151 M49 172 49 194"/>
      <g class="axis"><path d="M66 290v-22m0 22 17-9m-17 9-17-9"/><text x="63" y="263">Z</text><text x="85" y="283">X</text><text x="40" y="283">Y</text></g>
      ${floors}</svg>${pins}</div>`;
}

export function connectHouse(root, toggleRoom) {
  const drawing = root.querySelector(".drawing");
  const pins = [...drawing.querySelectorAll(".pin")];
  const volumes = [...drawing.querySelectorAll(".volume")];
  const pieces = [...drawing.querySelectorAll(".piece")];
  let owned = null;
  drawing.addEventListener("click", event => {
    const target = event.target.closest("[data-room], [data-volume]");
    if (target) toggleRoom(target.dataset.room ?? target.dataset.volume);
  });
  return (room, items) => {
    const nextOwned = new Set(items.filter(item => item.status !== "todo" && item.fk).map(item => item.fk));
    for (const piece of pieces) {
      const key = piece.dataset.piece;
      const solid = nextOwned.has(key);
      piece.classList.toggle("is-ghost", !solid);
      if (!solid) piece.classList.remove("settle");
      else if (owned && !owned.has(key)) piece.classList.add("settle");
    }
    owned = nextOwned;
    const active = volumes.some(volume => volume.dataset.volume === room);
    drawing.classList.toggle("has-room", active);
    for (const volume of volumes) volume.classList.toggle("selected", volume.dataset.volume === room);
    for (const pin of pins) {
      pin.setAttribute("aria-pressed", String(pin.dataset.room === room));
    }
  };
}
