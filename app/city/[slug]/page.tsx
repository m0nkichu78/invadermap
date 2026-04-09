import { notFound } from "next/navigation";
import { invadersByCity } from "@/lib/data/invaders";
import { getCityName } from "@/lib/data/cityNames";
import { BackButton } from "@/components/ui/BackButton";
import { CityInvadersGrid } from "@/components/cities/CityInvadersGrid";
import { CityHeader } from "@/components/cities/CityHeader";

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
  const totalPoints = invaders.reduce((s, i) => s + i.points, 0);

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

        <CityHeader
          invaders={invaders}
          totalPoints={totalPoints}
          ok={ok}
          damaged={damaged}
          destroyed={destroyed}
          activePct={activePct}
        />
      </div>

      <div className="px-3 pt-4">
        <CityInvadersGrid invaders={invaders} />
      </div>
    </div>
  );
}
