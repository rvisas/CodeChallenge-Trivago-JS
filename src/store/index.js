import { configureStore, createSlice } from '@reduxjs/toolkit';
import { survivalRule, mostFrequentColor } from './rules';
import { trivago } from './patterns/trivago';
import {
  drawMatrix,
  getNextGeneration,
  getCurrentLiving,
  updateCells,
  BLUE,
  ORANGE,
  RED,
} from '../utils';

// Constants
const COLORS = [BLUE, ORANGE, RED];
const INITIAL_FRAME_RATE = 200;
const COLUMNS = 103;
const ROWS = 67;

const calculateNextColor = (colorAmount) => (index) =>
  (index + 1) % (colorAmount + 1) === 0 ? 1 : index + 1;

const getNextColor = calculateNextColor(COLORS.length);

// Initial state
const initialState = {
  columns: COLUMNS,
  rows: ROWS,
  matrix: [],
  patterns: [trivago],
  rules: [survivalRule, mostFrequentColor],
  color: BLUE,
  running: false,
  frameRate: INITIAL_FRAME_RATE,
};

initialState.matrix = drawMatrix(
  initialState.columns,
  initialState.rows,
  initialState.patterns[0]
);

// Create slice with reducers
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startStop: (state) => {
      state.running = !state.running;
    },
    frameRateChange: (state, action) => {
      state.frameRate = action.payload;
    },
    tick: (state) => {
      state.matrix = drawMatrix(
        state.columns,
        state.rows,
        getNextGeneration(state.matrix, state.rules)
      );
    },
    reset: (state) => {
      state.matrix = drawMatrix(
        state.columns,
        state.rows,
        state.patterns[0]
      );
    },
    cellsSelected: (state, action) => {
      const [x, y] = action.payload;
      state.matrix = drawMatrix(
        state.columns,
        state.rows,
        updateCells(state.matrix, { [x]: [y, state.color] })
      );
    },
    storePattern: (state) => {
      state.patterns = [...state.patterns, getCurrentLiving(state.matrix)];
    },
    patternSelected: (state, action) => {
      state.matrix = drawMatrix(
        state.columns,
        state.rows,
        state.patterns[action.payload]
      );
    },
    colorChanged: (state) => {
      state.color = getNextColor(state.color);
    },
  },
});

// Export actions
export const {
  startStop,
  frameRateChange,
  tick,
  reset,
  cellsSelected,
  storePattern,
  patternSelected,
  colorChanged,
} = gameSlice.actions;

// Export reducer
export const gameReducer = gameSlice.reducer;

// Epic for running timer (using redux-observable pattern with RTK)
export const runTimeEpic = (action$, state$) =>
  action$.pipe(
    // We'll use a simple approach: when running changes to true, start interval
    // This is a simplified version - in production you'd use redux-observable or RTK Query
    // For now, we handle the tick in the component via useEffect
  );

// Configure store
export const store = configureStore({
  reducer: {
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Matrix contains nested arrays
    }),
});

export default store;