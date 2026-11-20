# Yuva

Yuva means “nest” or “home” in Turkish. It helps you plan a move one room at a time.

- [Design system](https://hilalys.github.io/yuva/?v=classic) — the original cut-paper style, with a checklist, a budget, and an isometric house that fills as you go.
- [Modern](https://hilalys.github.io/yuva/?v=modern) — the same core tools in a quieter, architectural workspace.
- [Basic](https://hilalys.github.io/yuva/?v=basic) — choose your home and household, then tick off the automatically generated essentials.

[Open Yuva](https://hilalys.github.io/yuva/) · [Compare the designs](https://hilalys.github.io/yuva/review/)

Use the pill in the bottom-left corner or the `[` and `]` keys to switch versions. Each version saves progress in the current browser; it isn't synced or shared. Starting prices are estimates, not live store prices.

## Run locally

Yuva is plain HTML, CSS, and JavaScript. No build or dependencies are required. From the directory containing `index.html`, serve it over HTTP:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Each version lives under `labs/`. The `model.js` module holds the shared starter list, budget math, and browser storage helpers.

## Publish

The standalone repository deploys `main` as a static site. In that repository, set **Settings → Pages → Source** to **GitHub Actions**, then run **Publish Yuva** from the **Actions** tab. Later changes to the site on `main` publish automatically.
