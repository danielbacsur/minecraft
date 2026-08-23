"use client";

import type { ReactNode } from "react";

export function Prompt({
  onSubmit,
  hint,
}: {
  onSubmit: (fields: { query: string }) => void;
  hint?: ReactNode;
}) {
  return (
    <div className="fixed bottom-5 left-1/2 z-10 w-[calc(100vw-32px)] -translate-x-1/2 touch-auto sm:bottom-14 sm:w-[min(40vw,660px)] sm:min-w-105">
      {hint ? (
        <p className="mb-2.5 flex items-center justify-center gap-2 text-center font-(family-name:--font-minecraft) text-[13px] leading-relaxed text-[rgb(70_88_115/0.72)] [text-shadow:0_1px_0_rgb(255_255_255/0.8)]">
          {hint}
        </p>
      ) : null}

      <form
        className="glass hover:glass-lit flex h-15 w-full items-center rounded-[20px] shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,box-shadow] duration-150 ease-out focus-within:shadow-[0_12px_40px_rgb(70_90_120/0.18),0_0_0_1px_rgb(150_180_220/0.18),inset_0_1px_0_rgb(255_255_255/1),inset_0_-1px_0_rgb(255_255_255/0.5)] motion-reduce:transition-none sm:h-18 sm:rounded-3xl"
        action={(data: FormData) => {
          const query = String(data.get("query") ?? "").trim();
          if (query) onSubmit({ query });
        }}
      >
        <span className="flex w-12 shrink-0 justify-center border-r border-[rgb(120_140_160/0.12)] text-[rgb(70_88_115/0.45)] sm:w-15">
          <Bubble />
        </span>

        <label className="sr-only" htmlFor="query">
          Describe your skin
        </label>

        <input
          id="query"
          name="query"
          placeholder="Type a prompt..."
          autoComplete="off"
          maxLength={1000}
          className="min-w-0 flex-1 bg-transparent px-3 text-[16px] tracking-[0.01em] text-[rgb(70_88_115/0.78)] outline-none placeholder:text-[rgb(70_88_115/0.45)] sm:px-5"
        />

        <button
          type="submit"
          aria-label="Submit prompt"
          className="mr-2 grid size-10 shrink-0 place-items-center rounded-full text-[rgb(70_88_115/0.5)] transition-[color,transform] duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] active:translate-y-0.5 motion-reduce:transition-none sm:mr-2.5 sm:size-11"
        >
          <Enter />
        </button>
      </form>
    </div>
  );
}

function Bubble() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 9 9"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M1 1h7v5H4L2 8V6H1z" />
    </svg>
  );
}

function Enter() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 8 8"
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <path d="M6 1h1v3H6z" />
      <path d="M2 4h5v1H2z" />
      <path d="M3 3h1v1H3z" />
      <path d="M3 5h1v1H3z" />
    </svg>
  );
}
