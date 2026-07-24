"use client";

import dynamic from "next/dynamic";

// The whole experience is WebGL/DOM-driven — never server-render it.
const Experience = dynamic(() => import("@/components/Experience"), {
  ssr: false,
  loading: () => <div className="boot" aria-hidden />,
});

export default function Page() {
  return (
    <main>
      <Experience />
    </main>
  );
}
