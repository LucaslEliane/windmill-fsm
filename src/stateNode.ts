import {
    DEFAULT_SPLITTER,
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
    public key: any;
    public parent: StateNode | null;
    public route: any[];
    public splitter: string;
    public id: string;
    public series: boolean;
    public beforeTransition: HookFunction[];
    public afterTransition: HookFunction[];
    public actions: object[];
    public config: any;


    constructor(config: any, options?: any) {
        this.key = config.key || config.name || '[default]';
        this.parent = config.parent;
        this.route = this.parent ? this.parent.route.concat(this.key) : [this.key];
        this.splitter = (options && options.splitter) || DEFAULT_SPLITTER;
        this.id = this.route.length ?
            this.route.join(this.splitter) :
            '';
        
        this.series = !!(config.on && config.on['']);

        this.beforeTransition = toArray<HookFunction>(config.beforeTransition);
        this.afterTransition = toArray<HookFunction>(config.afterTransition);
        this.actions = ObjToArray(config.on);
        this.config = config;
    }

    public findNextState(
        action?: string,
    ): string {
        const { actions } = this;

        let actionObj = actions.length && actions[0];

        if (!actionObj) {
            throw new Error(`
                StateNode ${this.id} 's actions is empty,
                But you try to transition an action.
            `);
        }

        action && actions.forEach(v => {
            v[action] && ( actionObj = v );
        });

        const actionName = Object.keys(actionObj)[0];
        const state = actionObj[actionName];
        
        return state;
    }

    public bindHooks(hooks: IHooks) {
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

    public transition(
        state: string,
        action: string,
        cb: (result: string, cb: () => void) => void
    ) {
        try {
            this.beforeTransition.forEach(value => {
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

    private _afterHooks(state?: string) {
        this.afterTransition.forEach(value => {
            value(state);
        });
    }


    public get getKey(): string {
        return this.key;
    }

    public get getActions(): object[] {
        return this.actions;
    }

    public get getId(): string {
        return this.id;
    }

    public get getParent(): StateNode | null {
        return this.parent;
    }

}