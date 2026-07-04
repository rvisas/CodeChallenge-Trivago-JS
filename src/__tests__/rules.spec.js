import {
    survivalRule,
    getMostFrequentColor,
    mostFrequentColor,
} from '../store/rules';
import { ALIVE, BLUE, ORANGE, RED } from '../utils';

describe('Rules - survivalRule (Conway\'s Game of Life)', () => {
    const createMatrix = (size = 5) => Array(size).fill().map(() => Array(size).fill([0, 0]));

    describe('Live cell survival', () => {
        it('should die with 0 neighbors (underpopulation)', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([false, BLUE]);
        });

        it('should die with 1 neighbor (underpopulation)', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            matrix[2][3] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([false, BLUE]);
        });

        it('should live with 2 neighbors', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([true, BLUE]);
        });

        it('should live with 3 neighbors', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            matrix[3][3] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([true, BLUE]);
        });

        it('should die with 4 neighbors (overpopulation)', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            matrix[3][3] = [ALIVE, BLUE];
            matrix[1][2] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([false, BLUE]);
        });

        it('should die with 8 neighbors (overpopulation)', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, BLUE];
            for (let i = 1; i <= 3; i++) {
                for (let j = 1; j <= 3; j++) {
                    if (i !== 2 || j !== 2) matrix[i][j] = [ALIVE, BLUE];
                }
            }
            expect(survivalRule(2, 2, matrix, [ALIVE, BLUE])).toEqual([false, BLUE]);
        });
    });

    describe('Dead cell reproduction', () => {
        it('should stay dead with 0 neighbors', () => {
            const matrix = createMatrix();
            expect(survivalRule(2, 2, matrix, [0, BLUE])).toEqual([false, BLUE]);
        });

        it('should stay dead with 1 neighbor', () => {
            const matrix = createMatrix();
            matrix[2][3] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [0, BLUE])).toEqual([false, BLUE]);
        });

        it('should stay dead with 2 neighbors', () => {
            const matrix = createMatrix();
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [0, BLUE])).toEqual([false, BLUE]);
        });

        it('should become alive with exactly 3 neighbors (reproduction)', () => {
            const matrix = createMatrix();
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            matrix[3][3] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [0, BLUE])).toEqual([true, BLUE]);
        });

        it('should stay dead with 4 neighbors', () => {
            const matrix = createMatrix();
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            matrix[3][3] = [ALIVE, BLUE];
            matrix[1][2] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [0, BLUE])).toEqual([false, BLUE]);
        });
    });

    describe('Color preservation', () => {
        it('should preserve ORANGE color for live cell', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, ORANGE];
            matrix[2][3] = [ALIVE, ORANGE];
            matrix[3][2] = [ALIVE, ORANGE];
            expect(survivalRule(2, 2, matrix, [ALIVE, ORANGE])).toEqual([true, ORANGE]);
        });

        it('should preserve RED color for live cell', () => {
            const matrix = createMatrix();
            matrix[2][2] = [ALIVE, RED];
            matrix[2][3] = [ALIVE, RED];
            matrix[3][2] = [ALIVE, RED];
            expect(survivalRule(2, 2, matrix, [ALIVE, RED])).toEqual([true, RED]);
        });

        it('should default to BLUE for dead cell with no color specified', () => {
            const matrix = createMatrix();
            matrix[2][3] = [ALIVE, BLUE];
            matrix[3][2] = [ALIVE, BLUE];
            matrix[3][3] = [ALIVE, BLUE];
            expect(survivalRule(2, 2, matrix, [0])).toEqual([true, BLUE]);
        });
    });

    describe('Edge cases', () => {
        it('should handle corner cells correctly', () => {
            const matrix = createMatrix(3);
            matrix[0][0] = [ALIVE, BLUE];
            matrix[0][1] = [ALIVE, BLUE];
            matrix[1][0] = [ALIVE, BLUE];
            expect(survivalRule(0, 0, matrix, [ALIVE, BLUE])).toEqual([true, BLUE]);
        });

        it('should handle edge cells correctly', () => {
            const matrix = createMatrix(5);
            matrix[0][2] = [ALIVE, BLUE];
            matrix[0][3] = [ALIVE, BLUE];
            matrix[1][2] = [ALIVE, BLUE];
            expect(survivalRule(0, 2, matrix, [ALIVE, BLUE])).toEqual([true, BLUE]);
        });
    });
});

describe('Rules - getMostFrequentColor', () => {
    it('should return most frequent color', () => {
        expect(getMostFrequentColor([1, 1, 1, 2, 3])).toBe(1);
        expect(getMostFrequentColor([2, 2, 1, 3, 3])).toBe(3); // tie: 2 appears twice, 3 appears twice -> last after sort
        expect(getMostFrequentColor([3, 3, 3, 1, 2])).toBe(3);
    });

    it('should handle tie by returning last after sort', () => {
        // When tied, the implementation sorts and takes last
        const result = getMostFrequentColor([1, 1, 2, 2]);
        expect([1, 2]).toContain(result);
    });

    it('should handle single element', () => {
        expect(getMostFrequentColor([BLUE])).toBe(BLUE);
        expect(getMostFrequentColor([ORANGE])).toBe(ORANGE);
        expect(getMostFrequentColor([RED])).toBe(RED);
    });

    it('should handle two elements same color', () => {
        expect(getMostFrequentColor([BLUE, BLUE])).toBe(BLUE);
    });

    it('should handle two elements different colors', () => {
        const result = getMostFrequentColor([BLUE, ORANGE]);
        expect([BLUE, ORANGE]).toContain(result);
    });

    it('should work with Color-Rule test cases from original tests', () => {
        expect(getMostFrequentColor([1, 1, 1, 3, 3, 2, 1])).toBe(1);
        expect(getMostFrequentColor([1, 1, 3, 3, 3, 3, 2, 1])).toBe(3);
    });
});

describe('Rules - mostFrequentColor (color rule)', () => {
    const createMatrix = (size = 5) => Array(size).fill().map(() => Array(size).fill([0, 0]));

    it('should return unchanged state for dead cell', () => {
        const matrix = createMatrix();
        const result = mostFrequentColor(2, 2, matrix, [0, BLUE]);
        // mostFrequentColor returns [isAlive, color] where isAlive is 0 or 1 (not boolean)
        expect(result).toEqual([0, BLUE]);
    });

    it('should return unchanged state for live cell with no neighbors', () => {
        const matrix = createMatrix();
        matrix[2][2] = [ALIVE, BLUE];
        const result = mostFrequentColor(2, 2, matrix, [ALIVE, BLUE]);
        expect(result).toEqual([1, BLUE]);
    });

    it('should change color based on neighbor majority', () => {
        const matrix = createMatrix();
        matrix[2][2] = [ALIVE, BLUE];
        matrix[2][3] = [ALIVE, ORANGE];
        matrix[3][2] = [ALIVE, ORANGE];
        matrix[3][3] = [ALIVE, ORANGE];
        // 3 ORANGE neighbors, 0 BLUE -> should become ORANGE
        const result = mostFrequentColor(2, 2, matrix, [ALIVE, BLUE]);
        expect(result).toEqual([1, ORANGE]);
    });

    it('should preserve color when neighbors have same color', () => {
        const matrix = createMatrix();
        matrix[2][2] = [ALIVE, RED];
        matrix[2][3] = [ALIVE, RED];
        matrix[3][2] = [ALIVE, RED];
        const result = mostFrequentColor(2, 2, matrix, [ALIVE, RED]);
        expect(result).toEqual([1, RED]);
    });

    it('should handle mixed colors and pick majority', () => {
        const matrix = createMatrix();
        matrix[2][2] = [ALIVE, BLUE];
        matrix[2][3] = [ALIVE, BLUE];
        matrix[3][2] = [ALIVE, ORANGE];
        matrix[3][3] = [ALIVE, ORANGE];
        matrix[1][2] = [ALIVE, ORANGE];
        // 3 ORANGE, 2 BLUE -> should become ORANGE
        const result = mostFrequentColor(2, 2, matrix, [ALIVE, BLUE]);
        expect(result).toEqual([1, ORANGE]);
    });

    it('should handle edge cells correctly', () => {
        const matrix = createMatrix(3);
        matrix[0][0] = [ALIVE, BLUE];
        matrix[0][1] = [ALIVE, ORANGE];
        matrix[1][0] = [ALIVE, ORANGE];
        // 2 ORANGE neighbors for corner cell
        const result = mostFrequentColor(0, 0, matrix, [ALIVE, BLUE]);
        expect(result).toEqual([1, ORANGE]);
    });
});

describe('Rules - Integration (both rules together)', () => {
    const createMatrix = (size = 5) => Array(size).fill().map(() => Array(size).fill([0, 0]));

    it('should apply survivalRule then mostFrequentColor in sequence', () => {
        const matrix = createMatrix();
        matrix[2][2] = [ALIVE, BLUE];
        matrix[2][3] = [ALIVE, ORANGE];
        matrix[3][2] = [ALIVE, ORANGE];
        matrix[3][3] = [ALIVE, ORANGE];

        // First survivalRule decides life/death
        const survival = survivalRule(2, 2, matrix, [ALIVE, BLUE]);
        expect(survival[0]).toBe(true); // lives with 3 neighbors

        // Then mostFrequentColor decides color
        const color = mostFrequentColor(2, 2, matrix, survival);
        expect(color).toEqual([true, ORANGE]); // majority is ORANGE
    });

    it('should handle dead cell becoming alive with color from neighbors', () => {
        const matrix = createMatrix();
        matrix[2][3] = [ALIVE, RED];
        matrix[3][2] = [ALIVE, RED];
        matrix[3][3] = [ALIVE, RED];

        const survival = survivalRule(2, 2, matrix, [0, BLUE]);
        expect(survival[0]).toBe(true); // reproduces with 3 neighbors

        const color = mostFrequentColor(2, 2, matrix, survival);
        expect(color).toEqual([true, RED]); // all neighbors RED
    });
});