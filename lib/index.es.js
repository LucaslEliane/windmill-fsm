class ParametersError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, ParametersError.prototype);
        this.name = 'ParametersError';
    }
}
class TransitionError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, TransitionError.prototype);
        this.name = 'TransitionError';
        Error.captureStackTrace(this, this.constructor);
    }
}

const DEFAULT_SPLITTER = '.';

function iterateState(states, iterate, depth) {
    if (!states) {
        return new Map();
    }
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
        result.set(key, iterate(Object.assign({}, currentState, { key })));
        if (currentState && currentState.states && Object.keys(currentState.states).length) {
            iterateState(currentState.states, iterate, depth);
        }
    });
    return result;
}
function toArray(value) {
    if (Array.isArray(value)) {
        return value;
    }
    if (value === undefined) {
        return [];
    }
    return [value];
}
function ObjToArray(value) {
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

class StateNode {
    constructor(config, options) {
        this.key = config.key || config.name || '[default]';
        this.parent = config.parent;
        this.route = this.parent ? this.parent.route.concat(this.key) : [this.key];
        this.splitter = (options && options.splitter) || DEFAULT_SPLITTER;
        this.id = this.route.length ?
            this.route.join(this.splitter) :
            '';
        this.series = !!(config.on && config.on['']);
        this.beforeTransition = toArray(config.beforeTransition);
        this.afterTransition = toArray(config.afterTransition);
        this.actions = ObjToArray(config.on);
        this.config = config;
    }
    findNextState(action) {
        const { actions } = this;
        let actionObj = actions.length && actions[0];
        if (!actionObj) {
            throw new Error(`
                StateNode ${this.id} 's actions is empty,
                But you try to transition an action.
            `);
        }
        action && actions.forEach(v => {
            v[action] && (actionObj = v);
        });
        const actionName = Object.keys(actionObj)[0];
        const state = actionObj[actionName];
        return state;
    }
    bindHooks(hooks) {
        const { beforeTransition, afterTransition } = this;
        const before = hooks.before || [];
        const after = hooks.after || [];
        before.forEach(f => {
            !~beforeTransition.indexOf(f) && beforeTransition.push(f);
        });
        after.forEach(f => {
            !~afterTransition.indexOf(f) && afterTransition.push(f);
        });
    }
    transition(state, action, cb) {
        try {
            this.beforeTransition.forEach(value => {
                value && value();
            });
        }
        catch (e) {
            console.error(e);
        }
        if (state) {
            cb(state, () => {
                this._afterHooks(state);
            });
            return;
        }
        throw new Error(`目标状态：\`${action}\`不存在!`);
    }
    _afterHooks(state) {
        this.afterTransition.forEach(value => {
            value(state);
        });
    }
    get getKey() {
        return this.key;
    }
    get getActions() {
        return this.actions;
    }
    get getId() {
        return this.id;
    }
    get getParent() {
        return this.parent;
    }
}

class Windmill {
    constructor(config, options) {
        this.root = this.current = this.initialNode = new StateNode(config, options);
        this.config = {
            history: config.history || 'default',
            initialState: config.initialState,
        };
        this.initialState = config.initialState;
        this.history = [];
        this._nodeMap = new Map();
        config.states
            && iterateState(config.states, (stateConfig) => {
                const stateNode = new StateNode(Object.assign({}, stateConfig, { parent: this.root }));
                this._nodeMap.set(stateNode.key, stateNode);
            }, 0);
    }
    start(startNode) {
        if (!startNode && !this.initialState) {
            console.error(`
                Start state machine expect a startNode or initialNode,
                But got startNode: ${startNode} & initialNode: ${this.initialState}
            `);
            return this;
        }
        const start = startNode || this.initialState;
        if (!this._nodeMap.has(start)) {
            throw new ParametersError(`
                Start state is not in the _nodeMap, please check your
                parameter ${startNode}
            `);
        }
        this.current = this._nodeMap.get(start);
        this.history.push(start);
        return this;
    }
    transition(action) {
        try {
            let resolved = false;
            typeof action === 'string'
                && (resolved = true)
                && this._resolveStateToNode(action);
            !action
                && typeof action !== 'boolean'
                && (resolved = true)
                && this._resolveStateToNode();
            !resolved && console.error(`
                empty action will trigger a empty transition.
            `);
        }
        catch (err) {
            console.error(err);
        }
        return this;
    }
    bindHooks(hooks, state) {
        let hookAll = false;
        if (!state || !state.length) {
            hookAll = true;
            state = [];
        }
        const { _nodeMap } = this;
        _nodeMap.forEach((v, k) => {
            if (hookAll || (state && ~state.indexOf(k))) {
                _nodeMap.get(k).bindHooks(hooks);
            }
        });
        return this;
    }
    get nodeMap() {
        return this._nodeMap;
    }
    _resolveStateToNode(action) {
        const nextState = this.current.findNextState(action);
        if (!this._nodeMap.has(nextState)) {
            throw new TransitionError(`target state: \`${nextState}\` is not exist.`);
        }
        const target = this._nodeMap.get(nextState);
        target.transition(nextState, action, (result, hooks) => {
            this._execTransition(result, hooks);
        });
    }
    _execTransition(result, hooks) {
        const resultNode = this._nodeMap.get(result);
        if (!resultNode) {
            throw new Error(`目标状态：\`${result}\`不存在!`);
        }
        this.current = resultNode;
        this.history.push(result);
        try {
            hooks();
        }
        catch (e) {
            console.error(e);
        }
    }
}

export default Windmill;
