import { createComponent, RECEIVE_PROPS } from 'melody-component';
import { identity, property } from 'lodash/fp';
import { compose, withRefs } from 'melody-hoc';
import { connect } from 'melody-redux';
import template from './index.twig';
import {
    actionCreator,
    dispatchTo,
    parseFields,
    drawHandler,
    BLUE,
    ORANGE,
    RED,
} from '../utils';

// ##############################################################
// ### TASK: WEB-104 Refactoring by removing code duplication ###
// ##############################################################
// TODO: Please take a look at the calls to `actionCreator` and `dispatchTo` inside the
// following two code sections.
// There seems to be some repetion here.
// Can you cut down the noise while still making usage of these helpers?

// Action creators that will dispatch the defined actions to the bound store when called.
const mapDispatchToProps = {
    startStop: actionCreator('START_STOP'),
    init: actionCreator('RESET'),
    cellsSelected: actionCreator('CELLS_SELECTED'),
    frameRate: actionCreator('FRAME_RATE_CHANGE'),
    storePattern: actionCreator('STORE_PATTERN'),
    patternSelected: actionCreator('PATTERN_SELECTED', property('target.id')),
    colorChanged: actionCreator('COLOR_CHANGED'),
};

// Higher-Order-Component that connects the component to a store and wraps the
// template refs to a dispatch method.
const enhance = compose(
    connect(
        identity,
        mapDispatchToProps,
    ),
    withRefs(component => ({
        powerSwitch: dispatchTo(component, 'click', 'startStop'),
        reset: dispatchTo(component, 'click', 'init'),
        colorSwitch: dispatchTo(component, 'click', 'colorChanged'),
        store: dispatchTo(component, 'click', 'storePattern'),
        pattern: dispatchTo(component, 'click', 'patternSelected'),
        framerateSlider: dispatchTo(component, 'change', 'frameRate'),
        grid: drawHandler(component),
    })),
);
export default enhance(createComponent(template));
