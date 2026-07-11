export type RewardNotificationKind = "sticker" | "achievement" | "theme" | "points";

export interface RewardNotification {
  id: string;
  kind: RewardNotificationKind;
  reward_key: string;
  title: string;
  message: string;
}
