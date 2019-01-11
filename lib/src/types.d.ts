export interface IHooks {
    before?: HookFunction[];
    after?: HookFunction[];
}
export declare type HookFunction = (state?: string) => void;
export interface IMachine {
    config: object;
}
//# sourceMappingURL=types.d.ts.map