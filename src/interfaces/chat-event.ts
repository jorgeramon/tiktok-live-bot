// Enums
import { FollowRole } from "@enums/follow-role";

export interface IChatEvent {
    comment: string;
    userId: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    followRole: FollowRole;
    msgId: string;
}