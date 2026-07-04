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
// Map-based action handlers for cleaner reducer logic
const createActionHandlers = (state) => ({
    START_STOP: () => ({ running: !state.running }),
    FRAME_RATE_CHANGE: (action) => ({ frameRate: action.payload.target.value }),
    TICK: () => ({
        matrix: drawMatrix(state.columns, state.rows, getNextGeneration(state.matrix, state.rules))
    }),
    RESET: () => ({
        matrix: drawMatrix(state.columns, state.rows, head(state.patterns))
    }),
    CELLS_SELECTED: (action) => {
        const [x, y] = action.payload;
        return {
            matrix: drawMatrix(state.columns, state.rows, updateCells(state.matrix, { [x]: [y, state.color] }))
        };
    },
    STORE_PATTERN: () => ({
        patterns: [...state.patterns, getCurrentLiving(state.matrix)]
    }),
    PATTERN_SELECTED: (action) => ({
        matrix: drawMatrix(state.columns, state.rows, state.patterns[action.payload])
    }),
    COLOR_CHANGED: () => ({
        color: getNextColor(state.color)
    })
});

const reducer = (state, action) => {
    const handlers = createActionHandlers(state);
    const handler = handlers[action.type];
    if (!handler) return state;
    return { ...state, ...handler(action) };
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
