import {
  drawMatrix,
  getCurrentLiving,
  updateCells,
  getNextGeneration,
  countNeighbours,
  getNeighbourColors,
  ALIVE,
  BLUE,
  ORANGE,
  RED,
} from '../utils';

describe('Utils tests', () => {
  describe('drawMatrix', () => {
    it('should create a matrix with correct dimensions', () => {
      const matrix = drawMatrix(3, 3, {});
      expect(matrix).toHaveLength(3);
      expect(matrix[0]).toHaveLength(3);
    });

    it('should set living cells correctly', () => {
      const livingCells = { 1: [[1, BLUE]] };
      const matrix = drawMatrix(3, 3, livingCells);
      expect(matrix[1][1]).toEqual([ALIVE, BLUE]);
    });

    it('should default dead cells to [0, 0]', () => {
      const matrix = drawMatrix(2, 2, {});
      expect(matrix[0][0]).toEqual([0, 0]);
    });
  });

  describe('getCurrentLiving', () => {
    it('should return empty object for empty matrix', () => {
      const matrix = drawMatrix(3, 3, {});
      expect(getCurrentLiving(matrix)).toEqual({});
    });

    it('should extract living cells correctly', () => {
      const livingCells = { 1: [[1, BLUE], [2, ORANGE]] };
      const matrix = drawMatrix(3, 3, livingCells);
      const current = getCurrentLiving(matrix);
      expect(current[1]).toEqual([[1, BLUE], [2, ORANGE]]);
    });
  });

  describe('updateCells', () => {
    it('should add new cell', () => {
      const matrix = drawMatrix(3, 3, {});
      const cell = { 1: [1, BLUE] };
      const updated = updateCells(matrix, cell);
      expect(updated[1]).toEqual([[1, BLUE]]);
    });

    it('should remove existing cell', () => {
      const livingCells = { 1: [[1, BLUE]] };
      const matrix = drawMatrix(3, 3, livingCells);
      const cell = { 1: [1, BLUE] };
      const updated = updateCells(matrix, cell);
      expect(updated[1]).toEqual([]);
    });
  });

  describe('getNextGeneration', () => {
    it('should apply survival rules', () => {
      // Block pattern - should stay alive
      const livingCells = {
        1: [[1, BLUE], [2, BLUE]],
        2: [[1, BLUE], [2, BLUE]],
      };
      const matrix = drawMatrix(4, 4, livingCells);
      const rules = [() => [true, BLUE]]; // Mock rule that keeps alive
      const nextGen = getNextGeneration(matrix, rules);
      expect(Object.keys(nextGen).length).toBeGreaterThan(0);
    });
  });

  describe('ALIVE constant', () => {
    it('should be 1', () => {
      expect(ALIVE).toBe(1);
    });
  });

  describe('Color constants', () => {
    it('should have correct values', () => {
      expect(BLUE).toBe(1);
      expect(ORANGE).toBe(2);
      expect(RED).toBe(3);
    });
  });
});