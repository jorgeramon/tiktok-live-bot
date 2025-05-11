import { RuntimeException } from "@exceptions/runtime";

export class MaximumRequestsReachedException extends RuntimeException {

    constructor(
        public readonly owner_username: string,
        public readonly stream_id: string,
        public readonly user_username: string
    ) {
        super();
    }
}