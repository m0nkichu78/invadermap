import dynamic from "next/dynamic";

const InvaderMap = dynamic(() => import("@/components/map/InvaderMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-[--bg]">
      <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  ),
});

export default function MapPage({
  searchParams,
}: {
  searchParams: { lat?: string; lng?: string; id?: string };
}) {
  const lat = searchParams.lat ? parseFloat(searchParams.lat) : undefined;
  const lng = searchParams.lng ? parseFloat(searchParams.lng) : undefined;
  return <InvaderMap initialLat={lat} initialLng={lng} initialId={searchParams.id} />;
}
