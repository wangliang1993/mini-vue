import {mutableHandles, readonlyHandles} from "./baseHandlers";

export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
    IS_READONLY = "__v_isReadonly"
}


function createActiveObject(raw: any, handles) {
    return new Proxy(raw, handles);
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandles);
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandles);
}

export function isReactive(value) {
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY];
}

