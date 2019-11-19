import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { head } from 'lodash/fp';
import {
    drawMatrix,
    getNextGeneration,
    getCurrentLiving,
    updateCells,
    BLUE,
    ORANGE,
    RED,
} from '../utils';
import { survivalRule, mostFrequentColor } from './rules';
import { runTimeEpic } from './epics';
import { trivago } from './patterns/trivago';

const colors = [BLUE, ORANGE, RED];

const calucluateNextColor = colorAmount => index =>
    (index + 1) % (colorAmount + 1) === 0 ? 1 : index + 1;

const getNextColor = calucluateNextColor(colors.length);

const initialState = {
    columns: 103,
    rows: 67,
    matrix: [],
    patterns: [trivago],
    rules: [survivalRule, mostFrequentColor],
    color: BLUE,
    running: false,
    frameRate: 200,
};

initialState.matrix = drawMatrix(
    initialState.columns,
    initialState.rows,
    initialState.patterns[0],
);

// ################################################################
// ### TASK: WEB-103 Implement planned refactoring for Reducer  ###
// ################################################################
// TODO: Before our engineer left this code base he had an idea to refactor
// this reducer to something like
//
// const map = {
//     TICK: ({ matrix }) => getNextGeneration(matrix, state.rules),
//     RESET: () => {},
//     CELLS_SELECTED: ({ matrix }, { payload }) => updateCells(matrix, payload),
//     PATTERN_SELECTED: ({ patterns }, { payload }) => patterns[payload]
// };
//
// Can you make her idea real?

const reducer = (state, action) => {
    const { matrix, columns, rows, patterns } = state;
    const output = { ...state };
    switch (action.type) {
        case 'START_STOP':
            output.running = !state.running;
            break;
        case 'FRAME_RATE_CHANGE':
            output.frameRate = action.payload.target.value;
            break;
        case 'TICK':
            output.matrix = drawMatrix(columns, rows, getNextGeneration(matrix, state.rules));
            break;
        case 'RESET':
            output.matrix = drawMatrix(columns, rows, head(patterns));
            break;
        case 'CELLS_SELECTED':
            const { payload } = action;
            const [x, y] = payload;
            output.matrix = drawMatrix(columns, rows, updateCells(matrix, { [x]: [y, state.color] }));
            break;
        case 'STORE_PATTERN':
            output.patterns = [...patterns, getCurrentLiving(matrix)];
            break;
        case 'PATTERN_SELECTED':
            output.matrix = drawMatrix(columns, rows, patterns[action.payload]);
            break;
        case 'COLOR_CHANGED':
            output.color = getNextColor(state.color);
            break;
    }
    return output;
};

const epicMiddleware = createEpicMiddleware();

export default function configureStore() {
    const store = createStore(
        reducer,
        initialState,
        applyMiddleware(epicMiddleware),
    );
    epicMiddleware.run(runTimeEpic);
    return store;
}
