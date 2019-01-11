import {
    DEFAULT_SPLITTER,
    HOOK_MAP,
} from './constants';

import {
    HookFunction,
    IHooks,
} from './types';

import {
    ObjToArray,
    toArray,
} from './utils';

export default class StateNode {
    private _key: any;
    private _parent: StateNode | null;
    private _route: any[];
    private _splitter: string;
    private _id: string;
    // private _series: boolean;
    private _beforeTransition: HookFunction[];
    private _afterTransition: HookFunction[];
    private _actions: object[];
    // private _config: any;


    constructor(config: any, options?: any) {
        this._key = config.key || config.name || '[default]';
        this._parent = config.parent;
        this._route = this._parent ? this._parent.route.concat(this.key) : [this.key];
        this._splitter = (options && options.splitter) || DEFAULT_SPLITTER;
        this._id = this._route.length ?
            this._route.join(this._splitter) :
            '';
        
        // this._series = !!(config.on && config.on['']);

        this._beforeTransition = toArray<HookFunction>(config.beforeTransition);
        this._afterTransition = toArray<HookFunction>(config.afterTransition);
        this._actions = ObjToArray(config.on);
        // this._config = config;
    }

    public findNextState(
        action?: string,
    ): string {
        const { _actions } = this;

        let actionObj = !action && _actions.length && _actions[0];

        action && _actions.forEach(v => {
            v[action] && ( actionObj = v );
        });
        
        if (!actionObj) {
            if (action) {
                throw new Error(`
                    action ${action} is not exist in
                    ${this._id} 's _actions list.
                `)
            }
            throw new Error(`
                StateNode ${this._id} 's _actions is empty,
                But you try to transition an action.
            `);
        }


        const actionName = Object.keys(actionObj)[0];
        const state = actionObj[actionName];
        
        return state;
    }

    public bindHooks(hooks: IHooks) {
        const { _beforeTransition, _afterTransition } = this;
        const before = hooks.before || [];
        const after = hooks.after || [];

        before.forEach(f => {
            !~_beforeTransition.indexOf(f) && _beforeTransition.push(f);
        });

        after.forEach(f => {
            !~_afterTransition.indexOf(f) && _afterTransition.push(f);
        });
    }

    public transition(
        state: string,
        action: string,
        cb: (result: string, cb: () => void) => void
    ) {
        try {
            this._beforeTransition.forEach(value => {
                value && value();
            });
        } catch (e) {
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

    public emit(
        ...args: any[]
    ) {
        const event = args[0];

        if (!event) return;

        const eventMap = this[HOOK_MAP[event]];

        try {
            eventMap.forEach((v: HookFunction) => {
                v && v(...args);
            });
        } catch (err) {
            console.error(`callback error: ${err}`);
        }
    }

    private _afterHooks(state?: string) {
        this._afterTransition.forEach(value => {
            value(state);
        });
    }


    public get key(): string {
        return this._key;
    }

    public get actions(): object[] {
        return this._actions;
    }

    public get id(): string {
        return this.id;
    }

    public get parent(): StateNode | null {
        return this._parent;
    }

    public get route(): any[] {
        return this._route;
    }

}