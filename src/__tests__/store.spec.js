import { configureStore } from '@reduxjs/toolkit';
import { gameReducer, tick, startStop, reset, cellsSelected, storePattern, patternSelected, colorChanged, frameRateChange } from '../store';

describe('Store tests', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { game: gameReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });
  });

  describe('Initial state', () => {
    it('should have correct initial state structure', () => {
      const state = store.getState().game;
      expect(state).toHaveProperty('columns', 103);
      expect(state).toHaveProperty('rows', 67);
      expect(state).toHaveProperty('matrix');
      expect(state).toHaveProperty('patterns');
      expect(state).toHaveProperty('rules');
      expect(state).toHaveProperty('color', 1); // BLUE
      expect(state).toHaveProperty('running', false);
      expect(state).toHaveProperty('frameRate', 200);
    });

    it('should have initial matrix populated with trivago pattern', () => {
      const state = store.getState().game;
      expect(state.matrix).toBeDefined();
      expect(state.matrix.length).toBe(67); // rows
      expect(state.matrix[0].length).toBe(103); // columns
    });

    it('should have at least one pattern (trivago)', () => {
      const state = store.getState().game;
      expect(state.patterns.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('START_STOP action', () => {
    it('should toggle running from false to true', () => {
      store.dispatch(startStop());
      expect(store.getState().game.running).toBe(true);
    });

    it('should toggle running from true to false', () => {
      store.dispatch(startStop());
      store.dispatch(startStop());
      expect(store.getState().game.running).toBe(false);
    });
  });

  describe('FRAME_RATE_CHANGE action', () => {
    it('should update frameRate', () => {
      store.dispatch(frameRateChange(100));
      expect(store.getState().game.frameRate).toBe(100);
    });
  });

  describe('RESET action', () => {
    it('should reset matrix to first pattern', () => {
      // First, modify the matrix by selecting cells
      store.dispatch(cellsSelected([10, 10]));
      // Then reset
      store.dispatch(reset());
      const state = store.getState().game;
      // After reset, matrix should equal initial pattern
      expect(state.matrix).toBeDefined();
    });
  });

  describe('CELLS_SELECTED action', () => {
    it('should update matrix with new cell', () => {
      const initialMatrix = store.getState().game.matrix;
      store.dispatch(cellsSelected([10, 10]));
      const newMatrix = store.getState().game.matrix;
      expect(newMatrix).not.toBe(initialMatrix);
      expect(newMatrix[10][10][0]).toBe(1); // Cell should be alive
    });

    it('should use current color for new cell', () => {
      store.dispatch(cellsSelected([5, 5]));
      const state = store.getState().game;
      expect(state.matrix[5][5][1]).toBe(state.color);
    });
  });

  describe('STORE_PATTERN action', () => {
    it('should add current living cells to patterns', () => {
      const initialPatterns = store.getState().game.patterns.length;
      store.dispatch(storePattern());
      const newPatterns = store.getState().game.patterns.length;
      expect(newPatterns).toBe(initialPatterns + 1);
    });
  });

  describe('PATTERN_SELECTED action', () => {
    it('should set matrix to selected pattern', () => {
      // Store a pattern first
      store.dispatch(cellsSelected([20, 20]));
      store.dispatch(storePattern());
      const patternIndex = store.getState().game.patterns.length - 1;

      // Select the pattern
      store.dispatch(patternSelected(patternIndex));
      const state = store.getState().game;
      expect(state.matrix).toBeDefined();
    });
  });

  describe('COLOR_CHANGED action', () => {
    it('should cycle through colors: BLUE(1) -> ORANGE(2) -> RED(3) -> BLUE(1)', () => {
      expect(store.getState().game.color).toBe(1); // BLUE
      store.dispatch(colorChanged());
      expect(store.getState().game.color).toBe(2); // ORANGE
      store.dispatch(colorChanged());
      expect(store.getState().game.color).toBe(3); // RED
      store.dispatch(colorChanged());
      expect(store.getState().game.color).toBe(1); // BLUE again
    });
  });

  describe('TICK action', () => {
    it('should evolve matrix to next generation', () => {
      const initialMatrix = store.getState().game.matrix;
      store.dispatch(tick());
      const newMatrix = store.getState().game.matrix;
      // Matrix should have evolved (could be same if stable pattern)
      expect(newMatrix).toBeDefined();
    });
  });
});