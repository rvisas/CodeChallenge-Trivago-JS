# trivago's Game of Life

## Preface

Welcome to the trivago version of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life).

This game is a cellular automaton, meaning it consists of a large matrix of cells that can change state over time.

In its original version, the game determines its evolution by its initial state, requiring no further input. The evolution of cells to be alive or dead are specified by a few simple rules.

Given one cell's current living state, the game takes the cell's neighbours' states into account and then calculates the successor state for the cell.
This rule is called the `survivalRule` or `Rule#1`. You can find its implementation in `store/rules.js`.

Our version adds a rule-chain to the game. That means our game can work with several rules at a time, which will be chained together. To make it more interesting, we implemented multi-color support for the game by adding a `colorRule` in the same direction. More information on the rules are found in the code.

The implementation you are looking at is written in a functional flavor on top of our own js-framework [Melody](https://melody.js.org).
Detailed knowledge of the framework itself is not needed to solve this case study. In case you are interested or feel the urge to read more documentation you can find it at [https://melody.js.org](https://melody.js.org);

Unfortunately, for some reasons, there are parts missing in this application, some need refactoring and we also spotted a bug (ouch!). Further information is given in the section "Tasks".

## Modernized Stack (2025)

This repository has been modernized from its original 2017 stack:

| Before (2017) | After (2025) |
|---------------|--------------|
| webpack 3.x | webpack 5.x |
| webpack-dev-server 2.x | webpack-dev-server 5.x |
| node-sass (deprecated) | **sass (Dart Sass)** |
| babel 6.x | **@babel/core 7.x + @babel/preset-env** |
| cssnano 3.x | **cssnano 7.x** |
| postcss-loader 3.x | **postcss-loader 8.x + PostCSS 8.x** |
| autoprefixer 7.x | **autoprefixer 10.x** |
| jest 24.x | **vitest 1.x** (ESM-native, faster) |
| yarn 1.x / npm 5.x | **npm 11.x** (lockfile: package-lock.json) |
| Node.js 8.x | **Node.js 24.x LTS** |

## Requirements

- **Node.js >= 20.x** (tested on 24.x LTS)
- **npm >= 10.x** (comes with Node.js)

## Setup

Install all required npm modules:

```sh
npm install
```

> **Note**: This project uses `--legacy-peer-deps` during install due to some legacy Melody framework dependencies that have strict peer requirements. This is expected and safe.

### Development

Start the development server with hot module replacement:

```sh
npm start
```

Opens http://localhost:3456 automatically.

### Production Build

```sh
npm run build
```

Outputs optimized bundle to `public/main.js`.

### Tests

Run the test suite (25 tests for Game of Life rules):

```sh
npm test
```

Tests are written with **Vitest** and run in a JSDOM environment.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:
- ✅ Install dependencies
- ✅ Build production bundle
- ✅ Run test suite

## The Tasks

### WEB-101: Find and fix the bug in the application

You probably have run the application already. If not, press the `Power` button on the TV.
Oh, that is really disappointing ... we were expecting cell evolution based on our initial pattern.
After some hundred generations it **should** turn into:

![](img/blue_cells.gif)

But after two generations all cells are immediately dead.
You see the following:

![](img/bug.jpg)

Please find and fix the bug!

**Hints:**
The heavy lifting of the application is done by some core utility functions inside the `./utils` folder.
These methods are safe and working, so they don´t need to be parsed for errors by you.
We believe the bug is coming more from a logical perspective that `Conway´s Game of Life` is relying on to be working properly. One engineer we spoke to indicated that it might be a problem with the implementation of the rules.
**Tip: Read the comments in the code.**

<br>

### WEB-102: Finish multi-color support implementation

Well done! You fixed the bug in WEB-101!
After some hundred generations (and without setting additional cells by you) the evolution **should** be stable with the following switching pattern:

![](img/gol_final.gif)

Instead, you're only getting blue cells evolving even though the application started with blue, orange and red cells:

![](img/blue_cells.gif)

Ah, right, our engineer fell sick while implementing the second rule before he could finish it. It is called `mostFrequentColor` and its helper function `getMostFrequentColor` is incomplete.
So this is your chance to implement it.
Please go to `./store/rules.js` and look out for *Task WEB-102*.

<br>

### WEB-103: A nicer reducer (OPTIONAL)

So, we have a working, coloured version now. Perfect.
Still, we think there should be some more refactorings done.

Take a look at `./store/index.js` and jump to the reducer.
It looks like a typical redux reducer, but our engineer had a great idea to remove the
duplication here as well.
Can you implement her idea?

<br>

### WEB-104: Remove code duplication by refactoring (OPTIONAL)

In the file `./view/index.js` our engineer did her best to remove boilerplate, noise and repetition by writing the helper functions `actionCreator` and `dispatchTo`.
These work well, but we still see a lot of duplication there.
Can you refactor these spots?

<br>

You have arrived at the end of the tasks! Well done!

We hope you had a bit of fun while working on this. If you want to know more about engineering at trivago, have a look at our [TechBlog](https://tech.trivago.com).

---

## Project Structure

```
src/
├── index.js              # App entry point
├── store/
│   ├── index.js          # Redux store + reducer (WEB-103)
│   └── rules.js          # Game rules (WEB-101, WEB-102)
├── utils/
│   └── index.js          # Core utilities (countNeighbours, etc.)
├── view/
│   ├── index.js          # View logic (WEB-104)
│   ├── index.twig        # Melody template
│   └── index.scss        # Styles (Sass)
└── __tests__/
    └── index.spec.js     # 25 tests for rules/utils
```

## License

Apache-2.0 © trivago