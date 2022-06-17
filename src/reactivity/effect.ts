import {extend} from "../shared";

const targetMap = new Map();
let activeEffect;
let shouldTrack;

function clearupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    })
    effect.deps.length = 0;
}

function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}

class ReactiveEffect {
    private _fn: any;
    public scheduler: Function | undefined;
    onStop?: () => void;
    deps = [];
    active = true;
    constructor(fn, scheduler?: Function) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        activeEffect = undefined;
        return result;
    }
    stop() {
        if (this.active) {
            clearupEffect(this);
            this.active = false;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}

export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);

    _effect.run()
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

export function track(target, key) {
    if (!isTracking()) return;

    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }

    // 如果这个 activeEffect 已经存在不需要在收集了！！
    if (dep.has(activeEffect)) return;

    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

export function stop(runner) {
    runner.effect.stop();
}