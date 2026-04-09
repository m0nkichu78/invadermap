import { notFound } from "next/navigation";
import { invadersByCity } from "@/lib/data/invaders";
import { getCityName } from "@/lib/data/cityNames";
import { BackButton } from "@/components/ui/BackButton";
import { CityInvadersGrid } from "@/components/cities/CityInvadersGrid";

function MiniStatusBar({ ok, damaged, destroyed, total }: {
  ok: number; damaged: number; destroyed: number; total: number;
}) {
  return (
    <div className="w-full h-1 bg-[--surface-2] rounded-full overflow-hidden flex mt-2">
      {ok        > 0 && <div className="h-full bg-success  shrink-0" style={{ width: `${(ok / total) * 100}%` }}        />}
      {damaged   > 0 && <div className="h-full bg-warning  shrink-0" style={{ width: `${(damaged / total) * 100}%` }}   />}
      {destroyed > 0 && <div className="h-full bg-danger   shrink-0" style={{ width: `${(destroyed / total) * 100}%` }} />}
    </div>
  );
}

export default function CityPage({ params }: { params: { slug: string } }) {
  const cityCode = params.slug.toUpperCase();
  const invaders = invadersByCity[cityCode];

  if (!invaders || invaders.length === 0) notFound();

  const ok        = invaders.filter((i) => i.status === "OK").length;
  const damaged   = invaders.filter((i) =>
    ["a little damaged", "damaged", "very damaged"].includes(i.status)
  ).length;
  const destroyed = invaders.filter((i) => i.status === "destroyed").length;
  const activePct = Math.round((ok / invaders.length) * 100);

  return (
    <div className="min-h-dvh bg-[--bg] pb-24">
      <div className="sticky top-0 z-10 bg-[--bg]/95 backdrop-blur-sm border-b border-[--border] px-4 pt-10 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <BackButton />
          <div>
            <p className="text-[10px] text-[--text-muted] uppercase tracking-widest leading-none mb-0.5">Villes</p>
            <h1 className="text-xl font-bold text-[--text] tracking-tight leading-none">
              {getCityName(cityCode)}
              <span className="ml-2 text-sm font-normal text-[--text-muted]">{cityCode}</span>
            </h1>
          </div>
        </div>

        <p className="text-xs text-[--text-muted]">
          <span className="text-[--text]">{invaders.length}</span> invaders ·{" "}
          <span className="text-success">{activePct}%</span> actifs ·{" "}
          <span className="text-accent">{invaders.reduce((s, i) => s + i.points, 0).toLocaleString()}</span> pts
        </p>

        <MiniStatusBar ok={ok} damaged={damaged} destroyed={destroyed} total={invaders.length} />
      </div>

      <div className="px-3 pt-4">
        <CityInvadersGrid invaders={invaders} />
      </div>
    </div>
  );
}
