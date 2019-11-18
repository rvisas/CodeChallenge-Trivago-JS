import { survivalRule, getMostFrequentColor } from '../store/rules';
import { countNeighbours, getNeighbourColors } from '../utils';

describe('Rules tests', () => {
    describe('Utility-Tests', () => {
        describe('CountNeigbours', () => {
            for (let n = 1; n <= 9; n++) {
                const m = [];
                let set = 0;
                for (let i = 0; i < 3; i++) {
                    m[i] = [];
                    for (let j = 0; j < 3; j++) {
                        m[i][j] = set < n ? [1, 1] : [0, 0];
                        set++;
                    }
                }
                m[1][1] = [1, 1];
                const expN = n >= 5 ? n - 1 : n; // Don´t count starting cell
                it(`should count ${expN} neighbours living`, () => {
                    expect(countNeighbours(m, 1, 1)).toBe(expN);
                });
            }
        });

        describe('getNeighbourColors', () => {
            for (let n = 1; n <= 9; n++) {
                const m = [];
                const exp = [];
                for (let i = 0; i < 3; i++) {
                    m[i] = [];
                    for (let j = 0; j < 3; j++) {
                        const color = Math.floor(Math.random() * 3) + 1;
                        m[i][j] = [1, color];
                        if (i === 1 && j === 1) continue; // Don´t collect starting cell
                        exp.push(color);
                    }
                }
                it(`should get ${exp} for neighboursColors`, () => {
                    expect(getNeighbourColors(m, 1, 1)).toEqual(exp);
                });
            }
        });
    });

    describe('Survival-Rule', () => {
        const patterns = [
            {
                description: '[START: ALIVE]  [NEIGHBOURS: <2]  [NEXT: DEAD ]',
                matrix: [
                    [[0, 2], [0, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                ],
                expectation: [false, 1],
            },
            {
                description: '[START: ALIVE]  [NEIGHBOURS: 2 ]  [NEXT: ALIVE]',
                matrix: [
                    [[1, 2], [0, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                ],
                expectation: [true, 1],
            },
            {
                description: '[START: ALIVE]  [NEIGHBOURS: >3]  [NEXT: DEAD ]',
                matrix: [
                    [[1, 2], [1, 2], [1, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                ],
                expectation: [false, 1],
            },
            {
                description: '[START: ALIVE]  [NEIGHBOURS: 3 ]  [NEXT: ALIVE]',
                matrix: [
                    [[0, 2], [1, 2], [0, 2]],
                    [[1, 2], [1, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                ],
                expectation: [true, 1],
            },
            {
                description: '[START: DEAD ]  [NEIGHBOURS: 3 ]  [NEXT: ALIVE]',
                matrix: [
                    [[1, 2], [0, 2], [0, 2]],
                    [[1, 2], [0, 2], [0, 2]],
                    [[0, 2], [1, 2], [0, 2]],
                ],
                expectation: [true, 1],
            },
        ];

        for (const { description, matrix, expectation } of patterns) {
            it(`${description}`, () => {
                expect(survivalRule(1, 1, matrix, [])).toEqual(expectation);
            });
        }
    });

    describe('Color-Rule', () => {
        it('should get color "1" as most frequent color', () => {
            const seed = [1, 1, 1, 3, 3, 2, 1];
            expect(getMostFrequentColor(seed)).toBe(1);
        });

        it('should get color "3" as most frequent color', () => {
            const seed = [1, 1, 3, 3, 3, 3, 2, 1];
            expect(getMostFrequentColor(seed)).toBe(3);
        });
    });
});
