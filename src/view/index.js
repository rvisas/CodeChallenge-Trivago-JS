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
// Single source of truth for action mappings:
// { actionName: [actionType, payloadExtractor?, eventType, refName] }
const actionConfig = {
    startStop:   ['START_STOP',            null, 'click', 'powerSwitch'],
    init:        ['RESET',                 null, 'click', 'reset'],
    cellsSelected: ['CELLS_SELECTED',      null, null,  'grid'],      // uses drawHandler
    frameRate:   ['FRAME_RATE_CHANGE',     null, 'change', 'framerateSlider'],
    storePattern:['STORE_PATTERN',         null, 'click', 'store'],
    patternSelected: ['PATTERN_SELECTED',  property('target.id'), 'click', 'pattern'],
    colorChanged:['COLOR_CHANGED',         null, 'click', 'colorSwitch'],
};

// Generate mapDispatchToProps from config
const mapDispatchToProps = Object.fromEntries(
    Object.entries(actionConfig).map(([key, [type, extractor]]) => [
        key,
        extractor ? actionCreator(type, extractor) : actionCreator(type)
    ])
);

// Generate withRefs bindings from config
const refsConfig = { grid: drawHandler }; // special case
Object.entries(actionConfig).forEach(([actionName, config]) => {
    const eventType = config[2];
    const refName = config[3];
    if (eventType && refName && refName !== 'grid') {
        refsConfig[refName] = dispatchTo(component => component.props[actionName], eventType);
    }
});

// Higher-Order-Component that connects the component to a store and wraps the
// template refs to a dispatch method.
const enhance = compose(
    connect(
        identity,
        mapDispatchToProps,
    ),
    withRefs(component => refsConfig),
);

export default enhance(createComponent(template));
