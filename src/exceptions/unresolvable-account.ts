import { RuntimeException } from "@exceptions/runtime";

export class UnresolvableAccountException extends RuntimeException {

    constructor(public readonly owner_username: string) {
        super();
    }
}