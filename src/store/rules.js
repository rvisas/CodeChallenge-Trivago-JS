import {
    getNeighbourColors,
    getCellColor,
    isCellAlive,
    countNeighbours,
    BLUE,
    ORANGE,
    RED
} from '../utils';
import { head, flowRight as compose, reduce } from 'lodash-es';

/**
 * This is the heart and main rule that was built after the origin rule of `Conways´s Game of Life`
 * also known as Rule#1.
 * It makes cell evolution possible at all.
 * The function follows this principles:
 * - Any live cell with fewer than two live neighbors dies, as if by underpopulation.
 * - Any live cell with two or three live neighbors lives on to the next generation.
 * - Any live cell with more than three live neighbors dies, as if by overpopulation.
 * - Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.
 *
 * @param {number} x
 * @param {number} y
 * @param {array} matrix
 * @param {array}
 *
 */
export const survivalRule = (x, y, matrix, [isAlive, color = BLUE]) => {
    const neighbours = countNeighbours(matrix, x, y);
    const cell = matrix[x][y];
    const cellColor = isCellAlive(cell) ? getCellColor(cell) : color;
    return [shouldLive(isCellAlive(cell), neighbours), cellColor];
};

const shouldLive = (isAlive, neighbors) => {
    if (isAlive) {
        return ((neighbors === 2) || (neighbors === 3)) ? true : false;
    } else {
        return (neighbors === 3) ? true : false;
    }
};

// ###########################################################
// ### TASK: WEB-102 Finish the `getMostFrequentColor` method  ####
// ###########################################################
// The `getMostFrequentColor` method was not finished by our engineer.
// She implemented it with a static return value of BLUE.
// Please finish the implemenation so that the method does what its description tells.

/**
 * Returns the most frequent color for its input params `neighbourColors`.
 * @param {array} neighbourColors
 */
// source: https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array
export const getMostFrequentColor = (neighbourColors) => {
    return neighbourColors.sort((a, b) =>
        neighbourColors.filter(v => v === a).length - neighbourColors.filter(v => v === b).length
    ).pop();
};

/**
 * This method determines the new color for a living cell by finding the most occurent color of the
 * cells neighbourhood.
 *
 * @param {number} x
 * @param {number} y
 * @param {array} matrix
 * @param {array}
 */
export const mostFrequentColor = (x, y, matrix, [isAlive, color]) => {
    if (!isAlive) return [isAlive, color];
    const neighbourColors = getNeighbourColors(matrix, x, y);
    if (neighbourColors.length < 1) return [isAlive, color];
    const highestColor = getMostFrequentColor(neighbourColors);
    return [isAlive, highestColor];
};
