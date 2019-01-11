import StateNode from '../src/stateNode';

describe('Base stateNode test', () => {
    it('check constructor', () => {
        const parentNode = new StateNode({});
        const testStateNode = new StateNode({
            key: 'active',
            on: {
                TOGGLE: 'inactive',
            },
            parent: parentNode,
        });

        const actions = testStateNode.getActions;
        const id = testStateNode.getId;
        const key = testStateNode.getKey;
        const parent = testStateNode.getParent;

        expect(actions.length).toEqual(1);
        expect(id).toBe('[default].active');
        expect(key).toBe('active');
        expect(parent).toBe(parentNode);
    });
    it('check empty constructor', () => {
        const emptyNode = new StateNode({});

        const actions = emptyNode.getActions;
        const id = emptyNode.getId;
        const key = emptyNode.getKey;
        
        expect(actions.length).toEqual(0);
        expect(id).toBe('[default]');
        expect(key).toBe('[default]');
    });
});

