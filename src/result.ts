export abstract class Result<T, K> {

    public static Ok = class <T> extends Result<T, never> {
        constructor(public readonly value: T) {
            super();
        }
    }
    public static Error = class <K> extends Result<never, K> {
        constructor(public readonly detail: K) {
            super();
        }
    }

    public static ok<T>(value: T): Result<T, any> {
        return new Result.Ok(value);
    }

    public static error<K>(detail: K): Result<any, K> {
        return new Result.Error(detail);
    }

    public static from<T, K>(operation: () => T): Result<T, K> {
        try {
            return new Result.Ok(operation());
        } catch (error) {
            return new Result.Error(error);
        }
    }

    public unwrap<T>(defaultValue: T): T {
        if (this instanceof Result.Ok) {
            return this.value;
        }
        return defaultValue;
    }

}
