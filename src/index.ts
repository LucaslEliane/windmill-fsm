import { ParametersError, TransitionError } from './error';
import StateNode from './stateNode';
import { IHooks, IMachine } from './types';
import { iterateState } from './utils';

class Windmill implements IMachine {
    public config: object;
    public root: StateNode;
    public history: any[];
    public current: StateNode;
    public initialNode: StateNode;
    
    private _nodeMap: Map<string, any>;
    private initialState: string;

    constructor(config: any, options?: any) {
        this.root = this.current = this.initialNode = new StateNode(config, options);
        
        this.config = {
            history: config.history || 'default',
            initialState: config.initialState,
        }

        this.initialState = config.initialState;
        this.history = [];


        this._nodeMap = new Map();
        config.states
            && iterateState(
                config.states,
                (stateConfig: any) => {
                    const stateNode = new StateNode({
                        ...stateConfig,
                        parent: this.root,
                    });
                    this._nodeMap.set(stateNode.key, stateNode);
                },
                0,
            );
    }

    public start(
        startNode?: string
    ): Windmill {
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

    public transition(
        action: string,
    ): Windmill {
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
        } catch (err) {
            console.error(err);
        }

        return this;
    }

    public bindHooks(hooks: IHooks, state?: string[]): Windmill {
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

    public get nodeMap(): Map<string, any> {
        return this._nodeMap;
    }

    private _resolveStateToNode(
        action?: string,
    ) {
        const nextState = this.current.findNextState(action);

        if (!this._nodeMap.has(nextState)) {
            throw new TransitionError(
                `target state: \`${nextState}\` is not exist.`
            )
        }

        const target = this._nodeMap.get(nextState);

        target.transition(
            nextState,
            action,
            (result: string, hooks: () => void) => {
                this._execTransition(result, hooks);
            },
        );
    }

    private _execTransition(
        result: string,
        hooks: () => void,
    ) {
        const resultNode = this._nodeMap.get(result);

        if (!resultNode) {
            throw new Error(`目标状态：\`${result}\`不存在!`);
        }

        this.current = resultNode;
        this.history.push(result);
        try {
            hooks();
        } catch (e) {
            console.error(e);
        }
    }
}

export default Windmill;