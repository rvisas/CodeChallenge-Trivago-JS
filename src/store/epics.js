import { interval, combineLatest, animationFrameScheduler, pipe } from 'rxjs';
import { startWith, map, takeUntil, switchMap, filter } from 'rxjs/operators';
import { negate } from 'lodash/fp';
import { ofType } from 'redux-observable';

const filterRunning = bool => state =>
    pipe(
        map(() => state.value.running),
        filter(bool),
    );

const takeWhenRunning = filterRunning(Boolean);
const takeWhenStopped = filterRunning(negate(Boolean));

/**
 * The games run-time-loop implemented as a rxjs-stream
 * @param {observable} action
 */
export const runTimeEpic = (action, state) =>
    combineLatest(
        action.pipe(ofType('START_STOP')),
        action.pipe(
            ofType('FRAME_RATE_CHANGE'),
            startWith(200),
        ),
    ).pipe(
        takeWhenRunning(state),
        map(() => state.value.frameRate),
        switchMap(frameRate =>
            interval(frameRate, animationFrameScheduler).pipe(
                map(() => ({ type: 'TICK' })),
                takeUntil(
                    action.pipe(
                        ofType('START_STOP'),
                        takeWhenStopped(state),
                    ),
                ),
            ),
        ),
    );
