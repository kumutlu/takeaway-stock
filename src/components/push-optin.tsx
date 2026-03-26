"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushOptIn({ publicKey }: { publicKey: string }) {
  const [status, setStatus] = useState<string>("");

  async function enablePush() {
    if (!("serviceWorker" in navigator)) {
      setStatus("Service worker not supported.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("Permission denied.");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription)
    });

    setStatus("Push enabled.");
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white/80 p-4 text-sm text-ink-600">
      <p className="font-semibold text-ink-900">Push notifications</p>
      <p className="mt-1 text-xs text-ink-500">
        Get reminders to log weekly order needs (Sun–Tue).
      </p>
      <button
        onClick={enablePush}
        className="mt-3 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
        type="button"
      >
        Enable push
      </button>
      {status && <p className="mt-2 text-xs text-ink-500">{status}</p>}
    </div>
  );
}
