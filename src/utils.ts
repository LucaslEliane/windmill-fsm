export function iterateState(
    states: any,
    iterate: (stateConfig: any) => void,
    depth: number,
) {
    if (!states) { return new Map(); }

    const keys = Object.keys(states);

    if (!(states && keys && keys.length)) {
        return new Map();
    }

    depth >= 5 && console.error(`
        State nesting level is too deep,
        please flatten your states or components
    `);

    const result = new Map();

    depth++;

    let currentState;

    Object.keys(states)
        .forEach((key, i) => {
            currentState = states[key];
            result.set(key, iterate({
                ...currentState,
                key,
            }));
            if (currentState && currentState.states && currentState.states.length) {
                iterateState(
                    currentState.states,
                    iterate,
                    depth,
                );
            }
        })

    return result;
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