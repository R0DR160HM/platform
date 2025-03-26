import { result } from "./result";

export interface IActorOptions<K> {
    emit: (value: K) => void
    close: () => void
}

export abstract class ActorError extends Error {
    constructor(message: string) {
        super(`[ActorError]: ${message}`);
    }
}
export class ActorClosed extends ActorError {
    constructor(public readonly actor: Actor<unknown, unknown>) {
        super(`Actor ${actor.pid} is already closed.`)
    }
}
export class ActorTimeout extends ActorError {
    constructor(public readonly actor: Actor<unknown, unknown>, timeout: number) {
        super(`Actor ${actor.pid} did not answer within ${timeout}ms.`)
    }
}


export class Actor<T, K> {
    
    private listeners: Array<(value: K) => void> = [];

    public readonly pid = Math.random().toString(16).slice(2);

    constructor(
        private implementation?: (options: IActorOptions<K>, message: T) => void | Promise<void>
    ) {}

    public get closed() {
        return this.implementation === undefined && typeof this.implementation !== 'function';
    }

    public addEventListener(listener: (value: K) => void) {
        this.listeners.push(listener);
    }

    public removeEventListener(listener: (value: K) => void) {
        this.listeners.splice(this.listeners.indexOf(listener), 1);
    }

    public send(message: T): result.Result<true, ActorError> {
        message = window.structuredClone(message)
        if (this.closed) {
            return result.error(new ActorClosed(this as any))
        } 
        this.implementation!(this.options, message);
        return result.ok(true)
    }

    public call(message: T, timeout: number): Promise<result.Result<K, ActorError>> {
        return new Promise(resolve => {
            if (this.closed) {
                return resolve(result.error(new ActorClosed(this as any)));
            }
            const listener = (value: K) => {
                this.removeEventListener(listener);
                resolve(result.ok(value));
            }
            this.addEventListener(listener)
            this.send(message);
            setTimeout(() => {
                this.removeEventListener(listener);
                resolve(result.error(new ActorTimeout(this as any, timeout)))
            }, timeout)
        })
    }

    public close() {
        delete this.implementation;
    }

    private get options(): IActorOptions<K> {
        return {
            close: () => {
                this.close();
            },
            emit: (value) => {
                for (const listener of this.listeners) {
                    listener(value);
                }
            }
        }
    }

}
