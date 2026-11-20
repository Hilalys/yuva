export const categories = [
  ["living", "Living room", "🛋️"],
  ["kitchen", "Kitchen", "🍳"],
  ["dining", "Dining", "🍽️"],
  ["bedroom", "Bedroom", "🛏️"],
  ["bathroom", "Bathroom", "🛁"],
  ["office", "Home office", "💻"],
  ["entry", "Entryway", "🚪"],
  ["laundry", "Laundry", "🧺"],
  ["balcony", "Balcony", "🌿"],
  ["general", "General & safety", "🔌"],
  ["cleaning", "Cleaning", "🧽"],
  ["storage", "Storage", "📦"],
  ["hosting", "Hosting & guests", "🫖"],
  ["movein", "Move-in & services", "🚚"],
].map(([id, name, emoji], index) => {
  const isRoom = index < 9;
  return { id, name, emoji, isRoom, color: `var(--${isRoom ? "room" : "cat"}-${id})` };
});

export const statuses = { todo: "To buy", bought: "Bought", have: "Have it" };
export const priorities = { 1: "Essential", 2: "Soon", 3: "Later" };
export const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format;

const catalog = {
  living: {
    Furniture: [
      ["Sofa", 899, 1, "sofa", 1, "bought"],
      ["TV stand", null, 2, "tvstand"],
      ["TV", null, 3, "tv"],
      ["Coffee table", 145, 2, "coffeetable"],
      ["Bookshelf", null, 3, "bookshelf"],
      ["Area rug", 90, 2, "rug"],
      ["Floor lamp", 45, 2, "floorlamp"],
      ["Plants", null, 3, "plants"],
    ],
  },
  kitchen: {
    Appliances: [
      ["Espresso machine", 179, 2, "espresso"],
      ["Coffee grinder", null, 3, "grinder"],
      ["Çaydanlık (Turkish tea pot)", 45, 1, "caydanlik"],
      ["Kitchen runner", null, 3, "kitchenrug"],
    ],
    Cookware: [["Pots and pans set", 74], ["Knife set"], ["Cutting board"]],
    Tableware: [["Plates and bowls"], ["Set of four mugs", 16, 2], ["Cutlery set"]],
  },
  dining: {
    Furniture: [
      ["Dining table", 220, 2, "diningtable"],
      ["Dining chair", 60, 2, "diningchairs", 2],
      ["Counter stool", null, 3, "stools", 2],
    ],
  },
  bedroom: {
    Furniture: [
      ["Bed frame", 320, 1, "bed"],
      ["Mattress", 450, 1, "bed", 1, "bought"],
      ["Nightstand", 60, 2, "nightstand", 2],
      ["Bedside lamp", null, 2, "bedlamp", 2],
      ["Dresser", null, 2, "dresser"],
      ["Bedroom rug", null, 3, "bedrug"],
    ],
    Bedding: [
      ["Duvet insert", 89, 1, null, 1, "bought"],
      ["Sheet set", null, 1, null, 2],
      ["Pillow", null, 1, null, 4, "have"],
    ],
  },
  bathroom: {
    Basics: [["Bath mat", 19, 1, "bathmat"], ["Towel set"], ["Shower curtain"]],
  },
  office: {
    Furniture: [
      ["Desk", 155, 1, "desk"],
      ["Office chair", null, 1, "officechair", 2],
      ["Monitor", null, 2, "monitor", 2],
      ["Chair mat", null, 3, "chairmat", 2],
    ],
  },
  entry: {
    Furniture: [
      ["Shoe cabinet", null, 2, "shoecabinet"],
      ["Coat rack", null, 2, "coatrack"],
      ["Doormat", 20, 1, "doormat"],
      ["Hallway runner", null, 3, "hallrunner"],
      ["Umbrella stand", null, 3, "umbrella"],
    ],
  },
  laundry: { Basics: [["Laundry hamper", 22, 1, "hamper"], ["Drying rack", null, 2]] },
  balcony: {
    Outdoor: [
      ["Balcony chair", null, 3, "balconychairs", 2],
      ["Small table", null, 3, "balconytable"],
      ["Planters", null, 3, "planters"],
      ["Outdoor rug", null, 3, "outdoorrug"],
    ],
  },
  general: { Safety: [["Smoke detector check"], ["Fire extinguisher", 30], ["Extension cords"]] },
  cleaning: { Basics: [["Vacuum", 110], ["Mop and bucket", null, 2]] },
  storage: { Basics: [["Storage bins", null, 2]] },
  hosting: { Basics: [["Extra blanket", null, 3]] },
  movein: { Services: [["Internet setup"], ["Renters insurance"]] },
};

export function seedItems() {
  return Object.entries(catalog).flatMap(([cat, groups]) =>
    Object.entries(groups).flatMap(([sub, rows]) =>
      rows.map(([name, price = null, pri = 1, fk = null, qty = 1, status = "todo"], index) => ({
        id: `${cat}-${sub.toLowerCase()}-${index + 1}`,
        name, cat, sub, qty, price, est: price !== null, pri, status, fk,
        fav: false, note: "", store: "", link: "",
      })),
    ),
  );
}

export function totals(items) {
  const cents = { planned: 0, spent: 0, toBuy: 0 };
  let missing = 0, priced = 0, done = 0, alreadyHave = 0;
  for (const { status, price, qty } of items) {
    if (status !== "todo") done++;
    if (status === "have") {
      alreadyHave++;
      continue;
    }
    if (price == null) {
      missing++;
      continue;
    }
    priced++;
    const cost = Math.round(price * 100) * qty;
    cents.planned += cost;
    cents[status === "bought" ? "spent" : "toBuy"] += cost;
  }
  return {
    planned: cents.planned / 100, spent: cents.spent / 100, toBuy: cents.toBuy / 100,
    missing, priced, done, alreadyHave,
  };
}

export function loadLocal(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(`yuva:${key}`);
    if (raw === null) return { value: fallback, error: "" };
    const value = JSON.parse(raw);
    if (!isValid(value)) throw new TypeError("Unexpected saved data");
    return { value, error: "" };
  } catch (error) {
    console.warn("Yuva: could not load browser storage", error);
    return { value: fallback, error: "Your saved list couldn't be loaded. This view may not reflect your last changes." };
  }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(`yuva:${key}`, JSON.stringify(value));
    return "";
  } catch (error) {
    console.warn("Yuva: could not save to browser storage", error);
    return "Your changes couldn't be saved in this browser. Keep this page open.";
  }
}
