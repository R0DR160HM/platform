export namespace result {

    export type Success<T> = [T, null];
    export type Failure<K> = [null, K];
    export type Result<T, K> = Success<T> | Failure<K>;

    export type ErrorDecoder<K> = (error: unknown) => K;

    
    export function ok<T>(value: T): Success<T> {
        return [value, null];
    }

    export function error<K>(detail: K): Failure<K> {
        return [null, detail];
    }

    // --------------------------

    export async function async<T, K>(promise: Promise<T>, errorDecoder: ErrorDecoder<K>): Promise<Result<T, K>> {
        try {
            const resp = await promise;
            return [resp, null];
        } catch (err: any) {
            err = errorDecoder(err);
            return [null, err];
        }
    }

    export function wrap<T, K>(op: () => T, errorDecoder: ErrorDecoder<K>): Result<T, K> {
        try {
            return [op(), null];
        } catch (err: any) {
            err = errorDecoder(err)
            return [null, err]
        }
    }

    export function unwrap<T>(result: Result<T, any>, defaultValue: T): T {
        const [value, error] = result;
        if (error !== null) {
            return defaultValue;
        }
        return value!;
    }

    export function map<T, K, T2>(result: Result<T, K>, callback: (value: T) => T2): Result<T2, K> {
        const [value, error] = result;
        if (error !== null) {
            return [null, error]
        }
        return [callback(value!), null];
    }

    export function mapError<T, K, K2>(result: Result<T, K>, callback: (detail: K) => K2): Result<T, K2> {
        const [value, error] = result;
        if (error !== null) {
            return [null, callback(error)]
        }
        return [value!, null]
    }

    export function tryWith<T, K, T2>(result: Result<T, K>, callback: (value: T) => Result<T2, K>): Result<T2, K> {
        const [value, error] = result;
        if (error !== null) {
            return [null, error];    
        }
        return callback(value!)
    }

}
