import StateNode from './stateNode';

export function iterateState(
    states: any,
    iterate: (stateConfig: any) => StateNode,
    depth: number,
    parent?: StateNode
) {
    if (depth) {
        if (!states) { return; }
    
        const keys = Object.keys(states);
    
        if (!(states && keys && keys.length)) {
            return;
        }
    }

    depth >= 5 && console.error(`
        State nesting level is too deep,
        please flatten your states or components
    `);

    depth++;

    let currentState;

    Object.keys(states)
        .forEach((key, i) => {
            currentState = states[key];
            const node = iterate({
                ...currentState,
                key,
                parent,
            });
            if (currentState && currentState.states && Object.keys(currentState.states).length) {
                iterateState(
                    currentState.states,
                    iterate,
                    depth,
                    node,
                );
            }
        });
}

export function toArray<T>(value: T[] | undefined | T): T[] {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined) {
        return [];
    }
    return [value];
}

export function ObjToArray(value: object | undefined): object[] {
    if (!value) {
        return [];
    }
    let arr = [];
    arr = Object.keys(value).map(v => {
        const obj = {};
        obj[v] = value[v];
        return obj;
    });

    return arr;
}