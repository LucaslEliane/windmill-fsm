import Windmill from '../src/index';

describe('Base Windmill test', () => {
    const windmill = new Windmill({
        initialState: 'inactive',
        name: 'toggle',
        states: {
            active: {
                on: {
                    STAY: 'active',
                    TOGGLE: 'inactive',
                },
                states: {
                    active_twice: {
                        on: {
                            TOGGLE: 'inactive',
                        }
                    }
                }
            },
            inactive: {
                on: {
                    TOGGLE: 'active'
                }
            },
        }
    });
    it('check constructor', () => {
        const currentNode = windmill.current;
        const key = currentNode.getKey;

        expect(key).toBe('toggle');
        expect(windmill.nodeMap.get('active').getActions.length).toBe(2);
    });
    it('empty states', () => {
        const emptyStates = new Windmill({
            initialState: 'active',
            name: 'toggle',
            states: {},
        });

        const nodeMap = emptyStates.nodeMap;

        expect(Object.getOwnPropertyNames(nodeMap).length).toBe(0);
    });
});


describe('Base Transition test', () => {
    const windmill = new Windmill({
        initialState: 'inactive',
        name: 'toggle',
        states: {
            active: {
                on: {
                    STAY: 'active',
                    TOGGLE: 'inactive',
                },
                states: {
                    active_twice: {
                        on: {
                            TOGGLE: 'inactive',
                        }
                    }
                }
            },
            inactive: {
                on: {
                    TOGGLE: 'active'
                }
            },
        }
    });
    it('expect start state is initialState', () => {
        windmill.start();

        const currentNode = windmill.current;

        const key = currentNode.getKey;

        expect(key).toBe('inactive');
    });
    it('expect register hooks', () => {
        windmill.bindHooks({
            before: [() => {
                throw new Error('this is an error before transition.');
            }],
            after: [(state) => {
                expect(state).toBe('active');
                throw new Error('this is an error after transition.');
            }]
        });
    })
    it('expect transition state is active', () => {
        windmill.transition('TOGGLE');

        const currentNode = windmill.current;

        expect(currentNode.getKey).toBe('active');
    });
    it('expect transition error', () => {
        windmill.transition('WRONG');
    });
    it('expect start error', () => {
        try {
            windmill.start('wrong');
        } catch (err) {
            expect(err.name).toBe('ParametersError');
        }
    })
})