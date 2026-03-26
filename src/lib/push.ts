import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";

if (publicKey && privateKey) {
  webpush.setVapidDetails("mailto:ops@wrapnbowl.com", publicKey, privateKey);
}

export function getVapidPublicKey() {
  return publicKey;
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: Record<string, unknown>
) {
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys");
  }
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
