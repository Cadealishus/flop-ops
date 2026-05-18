# Flop Ops GitHub Sections

Upload this whole folder to a GitHub repo and turn on GitHub Pages.

## Files

- `index.html` — main Flop Ops menu/lobby shell.
- `css/menu.css` — menu, lobby, armory, Microslop 369 sign-in, and UI styling.
- `js/menu.js` — menu logic, multiplayer lobby logic, armory logic, and iframe launcher.
- `game/game.html` — actual playable game page.
- `game/game.css` — game HUD/loading/cutscene styles.
- `game/game.js` — Three.js game code.
- `play-frame.html` — simple iframe-only test page that loads the game.

## How to run on GitHub Pages

1. Upload all files/folders exactly as-is.
2. Open `index.html` from GitHub Pages for the full menu.
3. Open `play-frame.html` if you only want the game inside a frame.
4. Keep your images in `Cadealishus/cadesphotos` and models in `Cadealishus/cades3dmodels`, because this code already points there.

## Multiplayer test

Use two browser windows:

- Window 1: click `HOST` with room `cade-room`.
- Window 2: click `JOIN` with the same room.

If GitHub Pages caches an old file, add a fake version at the end of the URL like `?v=2`.
