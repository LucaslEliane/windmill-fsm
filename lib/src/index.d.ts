import StateNode from './stateNode';
import { IHooks, IMachine } from './types';
declare class Windmill implements IMachine {
    config: object;
    root: StateNode;
    history: any[];
    current: StateNode;
    initialNode: StateNode;
    private _nodeMap;
    private initialState;
    constructor(config: any, options?: any);
    start(startNode?: string): Windmill;
    transition(action: string): Windmill;
    bindHooks(hooks: IHooks, state?: string[]): Windmill;
    readonly nodeMap: Map<string, any>;
    private _resolveStateToNode;
    private _execTransition;
}
export default Windmill;
//# sourceMappingURL=index.d.ts.map