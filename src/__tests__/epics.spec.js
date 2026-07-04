import { runTimeEpic } from '../store/epics';
import { of } from 'rxjs';

describe('Epics - runTimeEpic', () => {
    it('should be importable without errors', () => {
        expect(runTimeEpic).toBeDefined();
        expect(typeof runTimeEpic).toBe('function');
    });
});