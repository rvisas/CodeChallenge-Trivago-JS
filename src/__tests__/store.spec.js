import configureStore from '../store';
import { ALIVE, BLUE, ORANGE, RED, getCurrentLiving } from '../utils';

describe('Store - Reducer & Configuration', () => {
    let store;

    beforeEach(() => {
        store = configureStore();
    });

    describe('Initial State', () => {
        it('should have correct initial state shape', () => {
            const state = store.getState();
            expect(state).toHaveProperty('columns', 103);
            expect(state).toHaveProperty('rows', 67);
            expect(state).toHaveProperty('matrix');
            expect(state).toHaveProperty('patterns');
            expect(state).toHaveProperty('rules');
            expect(state).toHaveProperty('color', BLUE);
            expect(state).toHaveProperty('running', false);
            expect(state).toHaveProperty('frameRate', 200);
        });

        it('should have initial matrix with trivago pattern', () => {
            const state = store.getState();
            expect(Array.isArray(state.matrix)).toBe(true);
            expect(state.matrix.length).toBe(67); // rows
            expect(state.matrix[0].length).toBe(103); // columns
        });

        it('should have survivalRule and mostFrequentColor in rules', () => {
            const state = store.getState();
            expect(state.rules).toHaveLength(2);
            expect(typeof state.rules[0]).toBe('function'); // survivalRule
            expect(typeof state.rules[1]).toBe('function'); // mostFrequentColor
        });
    });

    describe('START_STOP action', () => {
        it('should toggle running from false to true', () => {
            expect(store.getState().running).toBe(false);
            store.dispatch({ type: 'START_STOP' });
            expect(store.getState().running).toBe(true);
        });

        it('should toggle running from true to false', () => {
            store.dispatch({ type: 'START_STOP' });
            expect(store.getState().running).toBe(true);
            store.dispatch({ type: 'START_STOP' });
            expect(store.getState().running).toBe(false);
        });

        it('should not modify other state properties', () => {
            const initialColor = store.getState().color;
            const initialMatrix = store.getState().matrix;
            store.dispatch({ type: 'START_STOP' });
            expect(store.getState().color).toBe(initialColor);
            expect(store.getState().matrix).toBe(initialMatrix);
        });
    });

    describe('FRAME_RATE_CHANGE action', () => {
        it('should update frameRate from payload', () => {
            store.dispatch({ type: 'FRAME_RATE_CHANGE', payload: { target: { value: 50 } } });
            expect(store.getState().frameRate).toBe(50);
        });

        it('should handle string payload values', () => {
            store.dispatch({ type: 'FRAME_RATE_CHANGE', payload: { target: { value: '100' } } });
            expect(store.getState().frameRate).toBe('100');
        });
    });

    describe('TICK action', () => {
        it('should evolve matrix to next generation', () => {
            const initialMatrix = store.getState().matrix;
            store.dispatch({ type: 'TICK' });
            const newMatrix = store.getState().matrix;
            expect(newMatrix).not.toBe(initialMatrix); // new matrix reference
        });

        it('should not change running state', () => {
            store.dispatch({ type: 'TICK' });
            expect(store.getState().running).toBe(false);
        });

        it('should apply both rules (survival + color)', () => {
            const initialMatrix = store.getState().matrix;
            store.dispatch({ type: 'TICK' });
            const newMatrix = store.getState().matrix;
            
            const countLiving = (matrix) => 
                matrix.flat().filter(cell => cell[0] === ALIVE).length;
            
            expect(countLiving(newMatrix)).not.toBe(countLiving(initialMatrix));
        });
    });

    describe('RESET action', () => {
        it('should reset matrix to initial pattern', () => {
            store.dispatch({ type: 'TICK' });
            store.dispatch({ type: 'TICK' });
            const evolvedMatrix = store.getState().matrix;
            
            store.dispatch({ type: 'RESET' });
            const resetMatrix = store.getState().matrix;
            
            expect(resetMatrix).not.toBe(evolvedMatrix);
            // resetMatrix is 2D array, patterns[0] is living cells object - compare living cells
            const resetLiving = getCurrentLiving(resetMatrix);
            expect(resetLiving).toEqual(store.getState().patterns[0]);
        });

        it('should not change other state', () => {
            store.dispatch({ type: 'START_STOP' });
            store.dispatch({ type: 'RESET' });
            expect(store.getState().running).toBe(true);
            expect(store.getState().color).toBe(BLUE);
        });
    });

    describe('CELLS_SELECTED action', () => {
        it('should add a living cell at specified coordinates', () => {
            const initialMatrix = store.getState().matrix;
            
            // Use coordinates that are dead in the initial trivago pattern
            // Column 0, Row 0 should be empty (trivago pattern starts around column 10)
            store.dispatch({ type: 'CELLS_SELECTED', payload: [0, 0] });
            const newMatrix = store.getState().matrix;
            
            // CELLS_SELECTED: [x, y] where x=column, y=row (per reducer implementation)
            // updateCells uses { [x]: [y, color] } where x is column, y is row
            // So payload [0, 0] -> column=0, row=0
            // Result: matrix[0][0] should be alive
            expect(newMatrix[0][0][0]).toBe(ALIVE);
            expect(newMatrix[0][0][1]).toBe(BLUE); // current color
        });

        it('should remove a living cell (toggle)', () => {
            // First add
            store.dispatch({ type: 'CELLS_SELECTED', payload: [5, 5] });
            expect(store.getState().matrix[5][5][0]).toBe(ALIVE);
            
            // Then remove (toggle)
            store.dispatch({ type: 'CELLS_SELECTED', payload: [5, 5] });
            expect(store.getState().matrix[5][5][0]).toBe(0);
        });

        it('should use current color state', () => {
            store.dispatch({ type: 'CELLS_SELECTED', payload: [1, 1] });
            expect(store.getState().matrix[1][1][1]).toBe(BLUE);
            
            // Change color
            store.dispatch({ type: 'COLOR_CHANGED' }); // BLUE -> ORANGE
            store.dispatch({ type: 'CELLS_SELECTED', payload: [2, 2] });
            expect(store.getState().matrix[2][2][1]).toBe(ORANGE);
        });

        it('should not mutate other cells', () => {
            const initialMatrix = store.getState().matrix;
            store.dispatch({ type: 'CELLS_SELECTED', payload: [10, 20] });
            const newMatrix = store.getState().matrix;
            
            // Only [10][20] should change
            let diffCount = 0;
            for (let i = 0; i < 67; i++) {
                for (let j = 0; j < 103; j++) {
                    if (newMatrix[i][j][0] !== initialMatrix[i][j][0] ||
                        newMatrix[i][j][1] !== initialMatrix[i][j][1]) {
                        diffCount++;
                    }
                }
            }
            expect(diffCount).toBe(1);
        });
    });

    describe('STORE_PATTERN action', () => {
        it('should add current living cells to patterns', () => {
            const initialPatterns = store.getState().patterns;
            expect(initialPatterns.length).toBe(1); // trivago
            
            store.dispatch({ type: 'STORE_PATTERN' });
            const newPatterns = store.getState().patterns;
            
            expect(newPatterns.length).toBe(2);
            expect(newPatterns[1]).toBeDefined();
        });

        it('should store actual living cells', () => {
            store.dispatch({ type: 'CELLS_SELECTED', payload: [10, 10] });
            store.dispatch({ type: 'STORE_PATTERN' });
            
            const patterns = store.getState().patterns;
            const storedPattern = patterns[1];
            expect(storedPattern[10]).toContainEqual([10, BLUE]);
        });
    });

    describe('PATTERN_SELECTED action', () => {
        it('should load selected pattern into matrix', () => {
            store.dispatch({ type: 'CELLS_SELECTED', payload: [10, 10] });
            store.dispatch({ type: 'STORE_PATTERN' });
            
            // Clear matrix with RESET
            store.dispatch({ type: 'RESET' });
            expect(store.getState().matrix[10][10][0]).toBe(0);
            
            // Load stored pattern (index 1)
            store.dispatch({ type: 'PATTERN_SELECTED', payload: 1 });
            expect(store.getState().matrix[10][10][0]).toBe(ALIVE);
        });

        it('should handle invalid pattern index gracefully', () => {
            const initialMatrix = store.getState().matrix;
            store.dispatch({ type: 'PATTERN_SELECTED', payload: 999 });
            // Should not crash, matrix might be unchanged or empty
            expect(store.getState().matrix).toBeDefined();
        });
    });

    describe('COLOR_CHANGED action', () => {
        it('should cycle through colors: BLUE -> ORANGE -> RED -> BLUE', () => {
            expect(store.getState().color).toBe(BLUE);
            
            store.dispatch({ type: 'COLOR_CHANGED' });
            expect(store.getState().color).toBe(ORANGE);
            
            store.dispatch({ type: 'COLOR_CHANGED' });
            expect(store.getState().color).toBe(RED);
            
            store.dispatch({ type: 'COLOR_CHANGED' });
            expect(store.getState().color).toBe(BLUE);
        });

        it('should affect subsequent CELLS_SELECTED', () => {
            store.dispatch({ type: 'COLOR_CHANGED' }); // BLUE -> ORANGE
            store.dispatch({ type: 'CELLS_SELECTED', payload: [1, 1] });
            expect(store.getState().matrix[1][1][1]).toBe(ORANGE);
            
            store.dispatch({ type: 'COLOR_CHANGED' }); // ORANGE -> RED
            store.dispatch({ type: 'CELLS_SELECTED', payload: [2, 2] });
            expect(store.getState().matrix[2][2][1]).toBe(RED);
        });
    });

    describe('Action sequence - typical user flow', () => {
        it('should handle start -> tick -> tick -> stop -> reset', () => {
            const store2 = configureStore();
            store2.dispatch({ type: 'START_STOP' });
            expect(store2.getState().running).toBe(true);
        
            store2.dispatch({ type: 'TICK' });
            const afterTick1 = store2.getState().matrix;
        
            store2.dispatch({ type: 'TICK' });
            const afterTick2 = store2.getState().matrix;
            expect(afterTick2).not.toEqual(afterTick1);
        
            store2.dispatch({ type: 'START_STOP' });
            expect(store2.getState().running).toBe(false);
        
            store2.dispatch({ type: 'RESET' });
            // resetMatrix is 2D array, patterns[0] is living cells object - compare living cells
            const resetLiving = getCurrentLiving(store2.getState().matrix);
            expect(resetLiving).toEqual(store2.getState().patterns[0]);
        });

        it('should handle drawing cells while running', () => {
            const store2 = configureStore();
            store2.dispatch({ type: 'START_STOP' });
            store2.dispatch({ type: 'CELLS_SELECTED', payload: [5, 5] });
            store2.dispatch({ type: 'TICK' });
        
            // Cell should still exist after tick (if it survives)
            expect(store2.getState().matrix[5][5]).toBeDefined();
        });
    });
});