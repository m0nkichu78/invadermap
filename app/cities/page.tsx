import { invadersByCity } from "@/lib/data/invaders";
import { CitiesClient, type CityStats } from "@/components/cities/CitiesClient";

export default function CitiesPage() {
  const cities: CityStats[] = Object.entries(invadersByCity).map(([code, invaders]) => {
    const ok        = invaders.filter((i) => i.status === "OK").length;
    const damaged   = invaders.filter((i) =>
      ["a little damaged", "damaged", "very damaged"].includes(i.status)
    ).length;
    const destroyed = invaders.filter((i) => i.status === "destroyed").length;

    return {
      code,
      total: invaders.length,
      ok,
      damaged,
      destroyed,
      activePct: Math.round((ok / invaders.length) * 100),
    };
  });

  return (
    <div className="min-h-dvh gradient-mesh pb-24">
      <CitiesClient cities={cities} />
    </div>
  );
}
