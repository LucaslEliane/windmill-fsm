import { HookFunction, IHooks } from './types';
export default class StateNode {
    key: any;
    parent: StateNode | null;
    route: any[];
    splitter: string;
    id: string;
    series: boolean;
    beforeTransition: HookFunction[];
    afterTransition: HookFunction[];
    actions: object[];
    config: any;
    constructor(config: any, options?: any);
    findNextState(action?: string): string;
    bindHooks(hooks: IHooks): void;
    transition(state: string, action: string, cb: (result: string, cb: () => void) => void): void;
    private _afterHooks;
    readonly getKey: string;
    readonly getActions: object[];
    readonly getId: string;
    readonly getParent: StateNode | null;
}
//# sourceMappingURL=stateNode.d.ts.map