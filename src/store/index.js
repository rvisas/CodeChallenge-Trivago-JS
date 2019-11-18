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
    switch (action.type) {
        case 'START_STOP': {
            return {
                ...state,
                running: !state.running,
            };
        }
        case 'FRAME_RATE_CHANGE': {
            return {
                ...state,
                frameRate: action.payload.target.value,
            };
        }
        case 'TICK': {
            return {
                ...state,
                matrix: drawMatrix(
                    columns,
                    rows,
                    getNextGeneration(matrix, state.rules),
                ),
            };
        }
        case 'RESET': {
            return {
                ...state,
                matrix: drawMatrix(columns, rows, head(patterns)),
            };
        }
        case 'CELLS_SELECTED': {
            const { payload } = action;
            const [x, y] = payload;
            return {
                ...state,
                matrix: drawMatrix(
                    columns,
                    rows,
                    updateCells(matrix, { [x]: [y, state.color] }),
                ),
            };
        }
        case 'STORE_PATTERN': {
            return {
                ...state,
                patterns: [...patterns, getCurrentLiving(matrix)],
            };
        }
        case 'PATTERN_SELECTED': {
            return {
                ...state,
                matrix: drawMatrix(columns, rows, patterns[action.payload]),
            };
        }
        case 'COLOR_CHANGED': {
            return {
                ...state,
                color: getNextColor(state.color),
            };
        }
        default: {
            return state;
        }
    }
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
