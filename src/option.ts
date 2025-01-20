export abstract class Option<T> {

    public static None = class extends Option<any> { }
    public static Some = class <T> extends Option<T> {
        constructor(public readonly value: T) {
            super();
        }
    }

    public static from<T>(value: T | null | undefined): Option<T> {
        return value === null || value === undefined
            ? new Option.None()
            : new Option.Some(value);
    }

    public static some<T>(value: T): Option<T> {
        return new Option.Some(value);
    }

    public static none(): Option<any> {
        return new Option.None();
    }

    public unwrap<T>(defaultValue: T): T {
        if (this instanceof Option.Some) {
            return this.value;
        }
        return defaultValue;
    }

}