/**
 * NOTE: ALL functions inside this file are working properly! No need to parse them for errors.
 */
import { flatten, head, compose, map, last, negate, identity } from 'lodash/fp';
import { fromEvent, concat, of } from 'rxjs';
import { switchMap, takeUntil, map as mapR } from 'rxjs/operators';

export const ALIVE = 1;
export const BLUE = 1;
export const ORANGE = 2;
export const RED = 3;
export const getCellState = head;
export const getCellColor = last;

const isEqual = (f, g) => args => f(args) === g(args);
const konstant = x => y => x;

export const isCellAlive = isEqual(getCellState, konstant(ALIVE));

const flattenedArrayIndexes = compose(
    flatten,
    map(head),
);

const elementMatchesCell = cell => tupel => head(tupel) === head(cell);

const ifElse = (predicate, onTruth, onFalse) => (...args) =>
    predicate(...args) ? onTruth(...args) : onFalse(...args);

const addItem = (current, item) =>
    (current && current.concat([item])) || [item];

const exists = (collection, cell) =>
    collection && flattenedArrayIndexes(collection).includes(head(cell));

const exclude = (collection, cell) =>
    collection.filter(negate(elementMatchesCell(cell)));

const writeCell = (collection, cell) => [
    ALIVE,
    getCellColor(collection.find(elementMatchesCell(cell))),
];

const deleteCell = konstant([0, 0]);
const addOrExclude = ifElse(exists, exclude, addItem);
const updateCellValue = ifElse(exists, writeCell, deleteCell);

/**
 * Routine that will create a new matrix and applies the supplied function given as third
 * argument to each cell.
 * @param {number} x
 * @param {number} y
 * @param {function} fn
 */
const drawLoop = (x, y, fn) => {
    const matrix = [];
    for (let i = 0; i < x; i++) {
        matrix[i] = [];
        for (let j = 0; j < y; j++) {
            matrix[i][j] = fn(i, j, (exFn, ...args) => exFn && exFn(...args));
        }
    }
    return matrix;
};

/**
 * Consistent Matrix boundaries that will stop array iteration before hitting out of bounds.
 * @param {array} matrix
 * @param {number} x
 * @param {number} y
 *
 * @example
 * const matrix = [...] // A 10x10 matrix
 * getMatrixBounds(matrix, 0,0) => [0,9,0,9]
 */
const getMatrixBounds = (matrix, x, y) => {
    return [
        Math.max(0, x - 1),
        Math.min(matrix.length - 1, x + 1),
        Math.max(0, y - 1),
        Math.min(head(matrix).length - 1, y + 1),
    ];
};

/**
 * Count one cells living neighbors
 * @param {array} matrix
 * @param {number} x
 * @param {number} y
 *
 * @example
 * countNeighbours([[...]], 10, 10) //=> 3
 */
export const countNeighbours = (matrix, x, y) => {
    let res = 0;
    const [
        lowerBoundX,
        upperBoundX,
        lowerBoundY,
        upperBoundY,
    ] = getMatrixBounds(matrix, x, y);
    for (let i = lowerBoundX; i <= upperBoundX; i++) {
        for (let j = lowerBoundY; j <= upperBoundY; j++) {
            if (x === i && y === j) continue;
            if (isCellAlive(matrix[i][j])) res += 1;
        }
    }
    return res;
};

/**
 * Collect all colors from one cells neighbors
 * @param {array} matrix
 * @param {number} x
 * @param {number} y
 *
 * @example
 * getNeighbourColors([[...]], 10, 10) //=> [1,1,1,2,1,3,1,3,3]
 */
export const getNeighbourColors = (matrix, x, y) => {
    const colors = [];
    const [
        lowerBoundX,
        upperBoundX,
        lowerBoundY,
        upperBoundY,
    ] = getMatrixBounds(matrix, x, y);
    for (let i = lowerBoundX; i <= upperBoundX; i++) {
        for (let j = lowerBoundY; j <= upperBoundY; j++) {
            if (x === i && y === j) continue;
            if (isCellAlive(matrix[i][j]))
                colors.push(getCellColor(matrix[i][j]));
        }
    }
    return colors;
};

/**
 * Applies updateCellValue() to the drawLoop which will result in a new matrix to be drawn
 * @param {number} cols
 * @param {number} rows
 * @param {object} livingCells
 */
export const drawMatrix = (cols, rows, livingCells = {}) =>
    drawLoop(rows, cols, (i, j, fn) =>
        fn(updateCellValue, livingCells[j], [i]),
    );

/**
 * Get all living cells from the matrix
 * @param {array} matrix
 */
export const getCurrentLiving = matrix => {
    const living = {};
    drawLoop(matrix.length, head(matrix).length, (i, j) => {
        const [cellState, cellColor] = matrix[i][j];
        if (cellState === ALIVE) living[j] = addItem(living[j], [i, cellColor]);
    });
    return living;
};

/**
 * Updates cells on the current location
 * Can be set to alive or dead
 * @param {array} matrix
 * @param {array} cell
 */
export const updateCells = (matrix, cell) => {
    const key = Object.keys(cell)[0];
    const current = getCurrentLiving(matrix);
    return {
        ...current,
        [key]: addOrExclude(current[key], cell[key]),
    };
};

/**
 * Applies a given ruleset to the drawloop,
 * that will determine the next living cells state of the matrix
 * @param {array} matrix
 * @param {array} rules
 */
export const getNextGeneration = (matrix, rules) => {
    const living = {};
    drawLoop(matrix.length, head(matrix).length, (i, j) => {
        const [alive, color] = rules.reduce(
            (acc, cur) => cur(i, j, matrix, acc),
            [],
        );
        if (alive) {
            living[j] = addItem(living[j], [i, color]);
        }
    });
    return living;
};

/**
 * Extracts an array of coordinates out of string prefixed with x,y
 * and corrects the index by -1
 * @param {string} string
 *
 * @example
 * parseFields('x15y64'); //=> [14, 63]
 */
export const parseFields = string => {
    const regex = /x(\d+)y(\d+)/;
    const [, x, y] = regex.exec(string);
    return [parseFloat(x) - 1, parseFloat(y) - 1];
};

/**
 * An action creator factory that creates typical redux store actions
 * @param {string} message
 * @param {function} accessor
 *
 * @example
 * actionCreator('FOO_BAR', 42); => { type: 'FOO_BAR', payload: 42 }
 */
export const actionCreator = (message, accessor = identity) => payload => ({
    type: message,
    ...(accessor(payload) && { payload: accessor(payload) }),
});

/**
 * Wraps all the arguments given on first partial application into an
 * rxjs-event stream 'fromEvent' of the given event type.
 * When called by the component in its withRefs-invocation on the ref, it will
 * dispatch to the corresponding function name supplied in 'fnName'.
 * @param {object} component
 * @param {string} eventType
 * @param {string} fnName
 * @param {*} payload
 * => @param {object} element partial application second level
 *
 * @example
 * dispatchTo(component, 'click, 'run')(ref);
 * //=> When mouse clicks on component it will trigger the 'run' method on the component
 */
export const dispatchTo = (component, eventType, fnName, payload) => element =>
    fromEvent(element, eventType).subscribe(event => {
        event.stopPropagation();
        component.props[fnName](payload || event);
    });

export const drawHandler = component => element =>
    fromEvent(element, 'mousedown')
        .pipe(
            switchMap(event => {
                event.preventDefault();
                return concat(of(event), fromEvent(element, 'mouseover')).pipe(
                    mapR(ev => parseFields(ev.target.id)),
                    takeUntil(fromEvent(element, 'mouseup')),
                );
            }),
        )
        .subscribe(component.props.cellsSelected);
