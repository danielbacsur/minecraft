"use client";

import { LuArrowUp, LuMessageSquare } from "react-icons/lu";

export function Prompt({
  copy,
  onSubmit,
}: {
  copy: { label: string; placeholder: string; submit: string };
  onSubmit: (fields: { query: string }) => void;
}) {
  return (
    <form
      className="mx-auto flex h-14 w-full max-w-2xl items-center gap-2 rounded-full glass px-2 transition motion-reduce:transition-none"
      action={(data: FormData) => {
        const query = String(data.get("query") ?? "").trim();
        if (query) onSubmit({ query });
      }}
    >
      <span className="grid size-11 shrink-0 place-items-center text-muted-foreground">
        <LuMessageSquare className="size-4" />
      </span>

      <label className="sr-only" htmlFor="query">
        {copy.label}
      </label>

      <input
        id="query"
        name="query"
        placeholder={copy.placeholder}
        autoComplete="off"
        maxLength={1000}
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />

      <button
        type="submit"
        aria-label={copy.submit}
        className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground active:translate-y-px motion-reduce:transition-none"
      >
        <LuArrowUp className="size-4" />
      </button>
    </form>
  );
}
