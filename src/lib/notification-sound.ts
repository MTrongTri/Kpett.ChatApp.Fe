const SOUND_ASSETS: Record<string, string> = {
  friend_request: "/sounds/friend-request.mp3",
  friend_accept: "/sounds/friend-accept.mp3",
  comment_mention: "/sounds/comment-mention.mp3",
  chat_message: "/sounds/notification-default.mp3",
  notification_default: "/sounds/notification-default.mp3",
};

const audioCache = new Map<string, HTMLAudioElement>();

const SOUND_ENABLED_KEY = "notification_sound_enabled";

const NOTIFICATION_TYPE_SOUND: Record<string, string> = {
  FriendRequestReceived: "friend_request",
  FriendRequestAccepted: "friend_accept",
  CommentMention: "comment_mention",
};

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const value = localStorage.getItem(SOUND_ENABLED_KEY);
  return value === null ? true : value === "true";
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

export function playSound(soundKey: string, volume = 0.8) {
  if (!isNotificationSoundEnabled()) return;

  const src = SOUND_ASSETS[soundKey] ?? SOUND_ASSETS.notification_default;
  if (!src) return;

  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }

  audio.pause();
  audio.currentTime = 0;
  audio.volume = Math.max(0, Math.min(volume, 1));
  void audio.play().catch(() => {});
}

export function getNotificationSoundKey(type: string): string {
  return NOTIFICATION_TYPE_SOUND[type] ?? "notification_default";
}
