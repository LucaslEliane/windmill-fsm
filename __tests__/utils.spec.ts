import { toArray } from '../src/utils';
import { ParametersError, TransitionError } from '../src/error';

describe('Base utils test', () => {
    it('toArray, parameter is an array yet', () => {
        const arr = [0, 1];

        const result = toArray(arr);

        expect(result[0]).toBe(0);
        expect(result.length).toBe(2);
    });

    it('toArray, pass a number, expect an array as return', () => {
        const result = toArray(1);

        expect(Array.isArray(result)).toBeTruthy();
    })
});

describe('Base Error test', () => {
    it('parameter error', () => {
        try {
            throw new ParametersError('parameters error');
        } catch (err) {
            expect(err.message).toBe('parameters error');
        }
    });

    it('transition error', () => {
        try {
            throw new TransitionError('transition error');
        } catch (err) {
            expect(err.message).toBe('transition error');
        }
    });
});
