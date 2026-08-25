"use client";

export function Prompt({
  onSubmit,
}: {
  onSubmit: (fields: { query: string }) => void;
}) {
  return (
    <form
      className="glass hover:glass-lit mx-auto flex h-18 w-full max-w-165 items-center rounded-3xl shadow-[0_8px_32px_rgb(70_90_120/0.14),inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(255_255_255/0.45)] transition-[background-color,border-color,box-shadow] duration-150 ease-out focus-within:shadow-[0_12px_40px_rgb(70_90_120/0.18),0_0_0_1px_rgb(150_180_220/0.18),inset_0_1px_0_rgb(255_255_255/1),inset_0_-1px_0_rgb(255_255_255/0.5)] motion-reduce:transition-none"
      action={(data: FormData) => {
        const query = String(data.get("query") ?? "").trim();
        if (query) onSubmit({ query });
      }}
    >
      <span className="flex w-15 shrink-0 justify-center border-r border-[rgb(120_140_160/0.12)] text-[rgb(70_88_115/0.45)]">
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
        className="min-w-0 flex-1 bg-transparent px-5 text-[16px] tracking-[0.01em] text-[rgb(70_88_115/0.78)] outline-none placeholder:text-[rgb(70_88_115/0.45)]"
      />

      <button
        type="submit"
        aria-label="Submit prompt"
        className="mr-2.5 grid size-11 shrink-0 place-items-center rounded-full text-[rgb(70_88_115/0.5)] transition-[color,transform] duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] active:translate-y-0.5 motion-reduce:transition-none"
      >
        <Enter />
      </button>
    </form>
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
