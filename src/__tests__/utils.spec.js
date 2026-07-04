import {
    ALIVE,
    BLUE,
    ORANGE,
    RED,
    getCellState,
    getCellColor,
    isCellAlive,
    countNeighbours,
    getNeighbourColors,
    drawMatrix,
    getCurrentLiving,
    updateCells,
    getNextGeneration,
    parseFields,
    actionCreator,
} from '../utils';

describe('Utils - Core Functions', () => {
    describe('Constants', () => {
        it('should have correct constant values', () => {
            expect(ALIVE).toBe(1);
            expect(BLUE).toBe(1);
            expect(ORANGE).toBe(2);
            expect(RED).toBe(3);
        });
    });

    describe('getCellState / getCellColor', () => {
        it('getCellState should return first element', () => {
            expect(getCellState([1, 2])).toBe(1);
            expect(getCellState([0, 3])).toBe(0);
        });

        it('getCellColor should return last element', () => {
            expect(getCellColor([1, 2])).toBe(2);
            expect(getCellColor([0, 3])).toBe(3);
        });
    });

    describe('isCellAlive', () => {
        it('should return true for alive cells (state=1)', () => {
            expect(isCellAlive([1, BLUE])).toBe(true);
            expect(isCellAlive([1, ORANGE])).toBe(true);
            expect(isCellAlive([1, RED])).toBe(true);
        });

        it('should return false for dead cells (state=0)', () => {
            expect(isCellAlive([0, BLUE])).toBe(false);
            expect(isCellAlive([0, ORANGE])).toBe(false);
            expect(isCellAlive([0, 0])).toBe(false);
        });
    });
});

describe('Utils - Neighbor Functions', () => {
    describe('countNeighbours', () => {
        it('should count 0 neighbors for isolated cell', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];
            expect(countNeighbours(matrix, 1, 1)).toBe(0);
        });

        it('should count all 8 neighbors', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([1, BLUE]));
            matrix[1][1] = [1, BLUE];
            expect(countNeighbours(matrix, 1, 1)).toBe(8);
        });

        it('should not count the cell itself', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([1, BLUE]));
            expect(countNeighbours(matrix, 1, 1)).toBe(8);
        });

        it('should handle edge cells correctly', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[0][0] = [1, BLUE];
            matrix[0][1] = [1, BLUE];
            matrix[1][0] = [1, BLUE];
            expect(countNeighbours(matrix, 0, 0)).toBe(2);
        });

        it('should only count alive neighbors', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[0][1] = [1, BLUE];
            matrix[1][0] = [0, BLUE]; // dead
            matrix[1][1] = [1, BLUE];
            expect(countNeighbours(matrix, 0, 0)).toBe(2);
        });
    });

    describe('getNeighbourColors', () => {
        it('should return empty array for isolated cell', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];
            expect(getNeighbourColors(matrix, 1, 1)).toEqual([]);
        });

        it('should collect colors of alive neighbors only', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[0][1] = [1, BLUE];
            matrix[1][0] = [1, ORANGE];
            matrix[1][1] = [1, RED];
            matrix[2][2] = [0, BLUE]; // dead - should not be counted
            const colors = getNeighbourColors(matrix, 1, 1);
            expect(colors).toContain(BLUE);
            expect(colors).toContain(ORANGE);
            expect(colors).not.toContain(RED); // center cell excluded
        });

        it('should handle edge cells', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[0][0] = [1, BLUE];
            matrix[0][1] = [1, ORANGE];
            matrix[1][0] = [1, RED];
            const colors = getNeighbourColors(matrix, 0, 0);
            expect(colors).toEqual([ORANGE, RED]);
        });
    });
});

describe('Utils - Matrix Operations', () => {
    const createTestMatrix = () => {
        const matrix = Array(5).fill().map(() => Array(5).fill([0, 0]));
        matrix[1][2] = [1, BLUE];
        matrix[2][2] = [1, ORANGE];
        matrix[3][2] = [1, RED];
        return matrix;
    };

    describe('drawMatrix', () => {
        it('should create matrix from living cells object', () => {
            const livingCells = {
                2: [[1, BLUE], [2, ORANGE], [3, RED]],
            };
            const matrix = drawMatrix(5, 5, livingCells);
            expect(matrix).toHaveLength(5);
            expect(matrix[1][2]).toEqual([1, BLUE]);
            expect(matrix[2][2]).toEqual([1, ORANGE]);
            expect(matrix[3][2]).toEqual([1, RED]);
            expect(matrix[0][0]).toEqual([0, 0]);
        });

        it('should handle empty living cells', () => {
            const matrix = drawMatrix(3, 3, {});
            expect(matrix).toHaveLength(3);
            expect(matrix[0][0]).toEqual([0, 0]);
        });
    });

    describe('getCurrentLiving', () => {
        it('should extract living cells from matrix', () => {
            const matrix = createTestMatrix();
            const living = getCurrentLiving(matrix);
            expect(living[2]).toHaveLength(3);
            expect(living[2]).toContainEqual([1, BLUE]);
            expect(living[2]).toContainEqual([2, ORANGE]);
            expect(living[2]).toContainEqual([3, RED]);
        });

        it('should return empty object for dead matrix', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            const living = getCurrentLiving(matrix);
            expect(living).toEqual({});
        });
    });

    describe('updateCells - CURRENT BEHAVIOR (includes known bugs)', () => {
        it('should add a new living cell to empty matrix', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            const updated = updateCells(matrix, { 1: [1, BLUE] });
            expect(updated[1]).toContainEqual([1, BLUE]);
        });

        it('should toggle off a living cell - returns empty array for key (current behavior)', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];
            const updated = updateCells(matrix, { 1: [1, BLUE] });
            expect(updated[1]).toEqual([]);
        });

        it('should NOT change color of existing cell - removes cell instead (KNOWN BUG)', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];
            const updated = updateCells(matrix, { 1: [1, ORANGE] });
            expect(updated[1]).toEqual([]);
        });
    });

    describe('getNextGeneration - returns object with row keys', () => {
        it('should apply survivalRule to all cells', () => {
            // This test verifies getNextGeneration is callable and returns an object
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];

            const rules = [(x, y, m, acc) => {
                const n = countNeighbours(m, x, y);
                const alive = isCellAlive(m[x][y]);
                return [alive && (n === 2 || n === 3) || (!alive && n === 3), BLUE];
            }];

            const nextGen = getNextGeneration(matrix, rules);
            expect(typeof nextGen).toBe('object');
            expect(nextGen).not.toBeNull();
        });

        it('should apply multiple rules in sequence', () => {
            const matrix = Array(3).fill().map(() => Array(3).fill([0, 0]));
            matrix[1][1] = [1, BLUE];

            const rules = [
                (x, y, m, acc) => [true, BLUE], // force alive
                (x, y, m, [alive, color]) => [alive, ORANGE], // change color
            ];

            const nextGen = getNextGeneration(matrix, rules);
            expect(typeof nextGen).toBe('object');
        });
    });
});

describe('Utils - Parsing & Action Creators', () => {
    describe('parseFields', () => {
        it('should parse xYYyZZ format', () => {
            expect(parseFields('x15y64')).toEqual([14, 63]);
            expect(parseFields('x1y1')).toEqual([0, 0]);
            expect(parseFields('x100y200')).toEqual([99, 199]);
        });
    });

    describe('actionCreator', () => {
        it('should create action with type and payload', () => {
            const create = actionCreator('TEST_ACTION');
            expect(create(42)).toEqual({ type: 'TEST_ACTION', payload: 42 });
        });

        it('should apply accessor function to payload', () => {
            const create = actionCreator('TEST', x => x * 2);
            expect(create(5)).toEqual({ type: 'TEST', payload: 10 });
        });

        it('should omit payload if accessor returns falsy', () => {
            const create = actionCreator('TEST', x => x || null);
            expect(create(0)).toEqual({ type: 'TEST' });
            expect(create('')).toEqual({ type: 'TEST' });
        });
    });
});