const variations = [
  { id: "classic", name: "Design system", idea: "Cut paper, bold room colors, and a house that fills as you go." },
  { id: "modern", name: "Modern", idea: "An architectural workspace with the same room list, budget, and progress." },
  { id: "basic", name: "Basic", idea: "A few household choices build a room-by-room checklist." },
];

const root = document.querySelector("#yuva");
const params = new URLSearchParams(location.search);
const variant = variations.find(({ id }) => id === params.get("v")) ?? variations[0];
document.title = `Yuva · ${variant.name}`;

const style = document.createElement("link");
style.rel = "stylesheet";
style.href = `./labs/${variant.id}/style.css`;

try {
  const ready = new Promise((resolve, reject) => {
    style.addEventListener("load", resolve, { once: true });
    style.addEventListener("error", () => reject(new Error("Variation stylesheet couldn't load")), { once: true });
    document.head.append(style);
  });
  const [{ mount }] = await Promise.all([import(`./labs/${variant.id}/index.js`), ready]);
  root.replaceChildren();
  mount(root);
} catch (error) {
  console.error(`Yuva: could not open the ${variant.id} variation`, error);
  const message = document.createElement("p");
  message.setAttribute("role", "alert");
  message.textContent = "This version of Yuva couldn't open. Reload the page or try another version.";
  root.replaceChildren(message);
}

window.labVariations = variations;
window.labReviewUrl = "./review/index.html";
await import("./lab-pill.js");
