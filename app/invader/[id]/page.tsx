import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { mappableInvaders } from "@/lib/data/invaders";
import { haversineDistance } from "@/lib/utils/distance";
import { getStatusBadgeClass } from "@/lib/utils/statusStyle";
import { getCityName } from "@/lib/data/cityNames";
import { ScanButtons } from "@/components/invader/ScanButtons";
import { CopyCoords } from "@/components/invader/CopyCoords";
import { DistanceDisplay } from "@/components/invader/DistanceDisplay";
import { NearbyInvadersScroll } from "@/components/invader/NearbyInvadersScroll";
import { BackButton } from "@/components/ui/BackButton";
import { ViewOnMapButton } from "@/components/invader/ViewOnMapButton";
import type { NearbyInvader } from "@/components/invader/NearbyInvadersScroll";

export default async function InvaderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: invader } = await supabase
    .from("invaders")
    .select("id, city, lat, lng, points, status, hint, image_url")
    .eq("id", params.id)
    .single();

  if (!invader) notFound();

  let nearby: NearbyInvader[] = [];
  if (invader.lat && invader.lng) {
    nearby = mappableInvaders
      .filter((inv) => inv.id !== invader.id)
      .map((inv) => ({
        id: inv.id,
        city: inv.city,
        status: inv.status,
        distance: haversineDistance(invader.lat!, invader.lng!, inv.lat!, inv.lng!),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }

  const statusBadge = getStatusBadgeClass(invader.status);

  return (
    <div className="min-h-dvh bg-[--bg] pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-10 pb-3 bg-[--bg]/95 backdrop-blur-sm border-b border-[--border]">
        <BackButton />
        <p className="text-xs text-[--text-muted] uppercase tracking-widest truncate">
          {getCityName(invader.city)}
        </p>
      </div>

      <div className="px-4 pt-6 pb-4 border-b border-[--border]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-5xl font-bold tracking-tighter text-accent leading-none mb-3">
              {invader.id}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider font-medium ${statusBadge}`}>
                {invader.status}
              </span>
              <span className="text-[10px] bg-[--accent-dim] text-accent px-2 py-1 rounded font-mono tracking-wider">
                {invader.points} pts
              </span>
            </div>
            {invader.hint && (
              <p className="mt-3 text-xs text-[--text-muted] italic leading-relaxed">
                {invader.hint}
              </p>
            )}
            {invader.lat && invader.lng && (
              <div className="flex items-center gap-4 flex-wrap mt-3">
                <CopyCoords lat={invader.lat} lng={invader.lng} />
                <DistanceDisplay lat={invader.lat} lng={invader.lng} />
              </div>
            )}
          </div>
          {invader.image_url && (
            <Image
              src={invader.image_url}
              alt={invader.id}
              width={96}
              height={96}
              className="rounded-lg object-cover flex-shrink-0"
            />
          )}
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] text-[--text-muted] uppercase tracking-widest">statut</p>
          <ScanButtons invaderId={invader.id} />
          {invader.lat && invader.lng && (
            <ViewOnMapButton lat={invader.lat} lng={invader.lng} id={invader.id} />
          )}
        </div>

        {nearby.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-[--text-muted] uppercase tracking-widest">à proximité</p>
            <NearbyInvadersScroll invaders={nearby} />
          </div>
        )}

        <Link
          href={`/city/${invader.city}`}
          className="flex items-center justify-between px-3 py-3 rounded-lg bg-[--surface] border border-[--border] hover:border-[--border-hover] transition-colors duration-150"
        >
          <span className="text-xs text-[--text-muted]">
            tous les invaders de{" "}
            <span className="text-[--text]">{getCityName(invader.city)}</span>
          </span>
          <CaretRight weight="regular" className="h-4 w-4 text-[--text-muted]" />
        </Link>
      </div>
    </div>
  );
}
