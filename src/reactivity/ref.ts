import {isTracking, trackEffects, triggerEffects} from "./effect";
import {hasChanged, isObject} from "../shared";
import {reactive} from "./reactive";

/**
 * 实现 ref 单值的对象包裹
 * 原理依赖收集与触发依赖（reactive）
 */
class RefImpl{
    private _value;
    private _rawValue;
    public dep;
    public __v_isRef = true;
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 如果值一样，不做set
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}

/**
 *
 * 是否是对象，如果是用reactive
 * @param value
 */
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

export function trackRefValue(ref) {
    if (isTracking()) {
        // 依赖收集
        trackEffects(ref.dep);
    }
}

export function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                target[key].value = value;
                return true;
            } else {
                return Reflect.set(target, key, value);
            }
        }
    })
}

export function ref(value) {
    return new RefImpl(value);
}

export function isRef(ref) {
    return !!ref.__v_isRef;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
