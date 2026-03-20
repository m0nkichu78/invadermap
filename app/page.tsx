import dynamic from "next/dynamic";

const InvaderMap = dynamic(() => import("@/components/map/InvaderMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-neutral-950">
      <p className="text-neutral-400 text-sm">Chargement de la carte…</p>
    </div>
  ),
});

export default function MapPage() {
  return <InvaderMap />;
}
