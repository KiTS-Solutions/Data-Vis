import type { ReactNode } from "react";
import { withBasePath } from "@/lib/basePath";

export function Section({
  title,
  children,
  first,
  last,
  level = 2,
  watermark,
}: {
  title: string;
  children: ReactNode;
  first?: boolean;
  last?: boolean;
  level?: 2 | 3;
  /** Large, low-opacity Stories icon bled off the top-right corner — the
   * same "faded logo behind a stats block" treatment storiescoffee.com uses
   * on its own Growth Timeline section. Reserve for KPI/stats-heavy
   * sections, not every section (it's a flourish, not a repeating motif). */
  watermark?: boolean;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  const headingClassName = level === 2 ? "mb-5 font-display text-xl text-ocean" : "mb-4 font-display text-lg text-ocean";

  return (
    <section
      className={`relative overflow-hidden ${first ? "pt-10" : "pt-12"} ${last ? "pb-14" : "border-b border-brand/15 pb-12"}`}
    >
      {watermark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={withBasePath("/stories-icon.png")}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 -z-10 h-72 w-72 -translate-y-4 translate-x-1/4 opacity-[0.06] dark:opacity-[0.12] sm:h-96 sm:w-96"
        />
      )}
      <Heading className={headingClassName}>{title}</Heading>
      {children}
    </section>
  );
}
