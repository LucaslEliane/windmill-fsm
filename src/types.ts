export interface IHooks {
    before?: HookFunction[],
    after?: HookFunction[],
}

export type HookFunction = (state?: string) => void;

export interface IMachine {
    config: object;
}