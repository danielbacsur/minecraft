"use client";

export function Prompt({
  onSubmit,
}: {
  onSubmit: (fields: { query: string }) => void;
}) {
  return (
    <form
      className="fixed bottom-5 left-1/2 z-10 flex h-[60px] w-[calc(100vw-32px)] -translate-x-1/2 touch-auto items-center rounded-[20px] border border-white/60 bg-gradient-to-b from-white/70 to-white/40 font-[family-name:var(--font-minecraft)] shadow-[0_8px_32px_rgb(70_90_120_/_0.14),inset_0_1px_0_rgb(255_255_255_/_0.95),inset_0_-1px_0_rgb(255_255_255_/_0.45)] backdrop-blur-[28px] backdrop-saturate-[1.8] transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-white/80 hover:from-white/80 hover:to-white/50 focus-within:shadow-[0_12px_40px_rgb(70_90_120_/_0.18),0_0_0_1px_rgb(150_180_220_/_0.18),inset_0_1px_0_rgb(255_255_255_/_1),inset_0_-1px_0_rgb(255_255_255_/_0.5)] motion-reduce:transition-none sm:bottom-14 sm:h-[72px] sm:w-[min(40vw,660px)] sm:min-w-[420px] sm:rounded-[24px]"
      action={(data: FormData) => {
        const query = String(data.get("query") ?? "").trim();
        if (query) onSubmit({ query });
      }}
    >
      <span className="flex w-12 shrink-0 justify-center border-r border-[rgb(120_140_160_/_0.12)] text-[rgb(70_88_115_/_0.45)] sm:w-[60px]">
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
        className="min-w-0 flex-1 bg-transparent px-3 text-[16px] tracking-[0.01em] text-[rgb(70_88_115_/_0.78)] outline-none placeholder:text-[rgb(70_88_115_/_0.45)] sm:px-5"
      />

      <button
        type="submit"
        aria-label="Submit prompt"
        className="mr-2 grid size-10 shrink-0 place-items-center rounded-full text-[rgb(70_88_115_/_0.5)] transition-[color,transform] duration-100 ease-out hover:text-[rgb(70_88_115_/_0.85)] active:translate-y-[2px] motion-reduce:transition-none sm:mr-2.5 sm:size-11"
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
