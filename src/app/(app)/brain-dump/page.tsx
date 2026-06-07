import { Suspense } from "react";
import { BrainDumpClient } from "./brain-dump-client";

export default function BrainDumpPage() {
  return (
    <Suspense fallback={<div className="text-stone-500">Loading brain dump...</div>}>
      <BrainDumpClient />
    </Suspense>
  );
}
