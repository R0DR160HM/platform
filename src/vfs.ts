import { result } from "./result";

export abstract class VFSError extends Error {
    constructor(message: string) {
        super(`[VFSError]: ${message}`);
    }
}
export class UnableToShare extends VFSError {
    constructor() {
        super('Unable to share files.')
    }
}

export namespace vfs {

    export function rename(file: File, newName: string): File {
        const blob = file.slice(0, file.size, file.type);
        return btf(blob, newName)
    }

    export function btf(blob: Blob, name: string): File {
        return new File([blob], name, { lastModified: Date.now(), type: blob.type })
    }

    export function materialize(file: File): void {
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(file);
        anchor.download = file.name;
        document.body.appendChild(anchor)
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(anchor.href);
    }

    export async function share(...files: File[]) {
        if (!navigator.canShare({ files })) {
            return result.error(new UnableToShare())
        }
        try {
            await navigator.share({ files })
            return result.ok(true);
        } catch (_) {
            return result.error(new UnableToShare());
        }
    }

}
