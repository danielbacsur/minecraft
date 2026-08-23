"use client";

type Scope = "anonymous" | "free" | "subscription";

const COPY: Record<
  Scope,
  { title: string; body: string; action: string; href: string; note: string }
> = {
  anonymous: {
    title: "That skin is yours to keep looking at.",
    body: "You have used your 3 free skins. Make a free account and you get 3 more every single day.",
    action: "Make a free account",
    href: "/auth",
    note: "One tap with Google, Discord or Microsoft. No email to type, no password to remember.",
  },

  free: {
    title: "That is 3 skins today.",
    body: "3 more tomorrow, {when}. Or go unlimited for $4.99 a month and download every skin you make straight into Minecraft.",
    action: "Go Unlimited",
    href: "/pricing",
    note: "Waiting is fine too. Your skins are still here in the morning.",
  },

  subscription: {
    title: "Downloads are part of Unlimited.",
    body: "Your skin is right there, and it stays there. Putting the file into Minecraft comes with Unlimited — $4.99 a month, as many skins as you like, every one of them downloadable.",
    action: "Go Unlimited",
    href: "/pricing",
    note: "Everything you have made stays here either way. Ask a grown-up first — it is a real payment.",
  },
};

export function Paywall({
  scope,
  onDismiss,
}: {
  scope: Scope;
  onDismiss: () => void;
}) {
  const { title, body, action, href, note } = COPY[scope];

  return (
    <div className="fixed inset-x-4 bottom-26 z-10 touch-auto sm:inset-x-auto sm:top-1/2 sm:right-8 sm:bottom-auto sm:w-85 sm:-translate-y-1/2">
      <aside className="glass animate-slide relative flex flex-col gap-3 rounded-[20px] p-5 text-[rgb(70_88_115/0.78)] shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] motion-reduce:animate-none sm:rounded-3xl sm:p-6">
        <button
          type="button"
          aria-label="Close"
          onClick={onDismiss}
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-[rgb(70_88_115/0.45)] transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
        >
          <Cross />
        </button>

        <h2 className="pr-8 text-[17px] leading-snug text-[rgb(70_88_115/0.95)]">
          {title}
        </h2>

        <p className="text-[14px] leading-relaxed">
          {body.replace("{when}", untilMidnight())}
        </p>

        <a
          href={href}
          className="mt-1 grid h-11 place-items-center rounded-[14px] border border-white/70 bg-linear-to-b from-white/85 to-white/55 text-[15px] text-[rgb(70_88_115/0.95)] shadow-[inset_0_1px_0_rgb(255_255_255/1)] transition-[background-color,transform] duration-100 ease-out hover:from-white/95 hover:to-white/65 active:translate-y-0.5 motion-reduce:transition-none"
        >
          {action}
        </a>

        <p className="text-[12px] leading-relaxed text-[rgb(70_88_115/0.55)]">
          {note}
        </p>
      </aside>
    </div>
  );
}

function untilMidnight() {
  const now = new Date();

  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );

  const hours = Math.round((midnight - now.getTime()) / 3_600_000);

  if (hours < 1) return "in under an hour";

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    hours,
    "hour",
  );
}

function Cross() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 7 7"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M0 0h1v1H0zM1 1h1v1H1zM2 2h1v1H2zM3 3h1v1H3zM4 4h1v1H4zM5 5h1v1H5zM6 6h1v1H6z" />
      <path d="M6 0h1v1H6zM5 1h1v1H5zM4 2h1v1H4zM2 4h1v1H2zM1 5h1v1H1zM0 6h1v1H0z" />
    </svg>
  );
}
