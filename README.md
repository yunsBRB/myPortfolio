# YUNS

My interactive portfolio: a small 3D room, a virtual desktop, and a few things I enjoy outside coding.

**[Explore the portfolio](https://yunsbrb.github.io/myPortfolio/)**

I'm Younes Berebia, a junior Full Stack Java developer in training in Belgium. My background is in marketing and management, and I'm interested in application security.

## Explore

The small dots mark interactive objects. Open the computer to enter YUNS OS, or use the Explore menu to go straight to my projects, skills, journey and contact details.

- The laptop opens 2048 and Tetris.
- The basketball, Rubik's cube and posters open short personal notes.
- The security lab demonstrates login-pattern detection with sample records.
- The desktop has movable windows, a terminal and a keyboard launcher (`Ctrl K`).

The interface is in English.

## Run locally

Serve the repository root over HTTP. For example:

```sh
python -m http.server 8080
```

Then open `http://localhost:8080/`. WebStorm's built-in web server also works. ES modules need HTTP; opening `index.html` through `file://` will not work.

No dependency installation or build step is required. Three.js 0.187.0 is included in `vendor/`, with its MIT license.

## Checks

Requires Node.js 20 or later:

```sh
npm ci
npm run format:check
npm run check
```

This checks JavaScript syntax and local assets, then runs 13 tests covering 2048, sample login detection and Tetris. Run `npm test` to run only the tests.

## Source files

| File                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `src/js/content.js`  | Profile links, projects, skills and timeline     |
| `src/js/world.js`    | Procedural room geometry, furniture and objects  |
| `src/js/room.js`     | Camera, object selection, renderers and lighting |
| `src/js/art.js`      | Vector artwork on posters and screens            |
| `src/js/app.js`      | Navigation, virtual windows and app interfaces   |
| `src/css/styles.css` | Layout, desktop styling and mobile adaptations   |
| `src/js/engines.js`  | 2048 and sample login-analysis logic             |
| `src/js/tetris.js`   | Falling-block game logic                         |

Tests live in `tests/`, project checks in `scripts/`, and earlier import records in `docs/history/`.

### Formatting

Use two spaces for indentation, as defined in `.editorconfig` and `.prettierrc.json`. Keep functions and blocks on separate lines. WebStorm can read the editor settings directly.

After editing, run:

```sh
npm run format
```

The formatter skips third-party files in `vendor/`, binary assets and historical records. Node.js and Prettier are development tools only; the published site needs no installation.

## Hosting

GitHub Pages publishes `main` from the repository root. `.nojekyll` keeps the files as a plain static site. All application assets use relative paths so the site works under `/myPortfolio/`.

The existing [Super Mario](https://yunsbrb.github.io/myPortfolio/demos/super-mario/) and [learning progress](https://yunsbrb.github.io/myPortfolio/demos/learning-progress/) demos remain at their original paths. Previous versions remain in Git history.

## Rendering and data

Three.js WebGL is the primary renderer. If WebGL is unavailable, SVGRenderer uses the same geometry, camera and object selection. Lighting and shadows differ between renderers. Browser checks in the development environment used the SVG fallback; hardware WebGL rendering has not been visually verified there.

Keyboard navigation and the Explore menu provide direct access to the portfolio sections. The interface respects reduced motion. Ambient sound is synthesized locally and starts off. Theme preference and the 2048 best score use localStorage when available.

