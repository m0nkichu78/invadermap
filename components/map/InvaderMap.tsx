"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { Crosshair, CheckCircle, Eye, X, type Icon as PhosphorIcon } from "@phosphor-icons/react";
import { mappableInvaders } from "@/lib/data/invaders";
import type { InvaderStatus } from "@/lib/types/invader";
import type { ScanStatus } from "@/lib/types/scan";
import { useMapStore, STATUS_FILTER_MAP, type StatusFilterKey } from "@/lib/store/mapStore";
import { useUserStore } from "@/lib/store/userStore";
import { haversineDistance } from "@/lib/utils/distance";
import { upsertScan } from "@/lib/actions/scans";
import { STATUS_BADGE_INLINE } from "@/lib/utils/statusStyle";
import { createMarkerElement, setMarkerScan } from "@/lib/map/createMarker";
import { StatusFilterBar } from "./StatusFilterBar";
import { ProximityButton } from "./ProximityButton";

// ── Token ─────────────────────────────────────────────────────────────────────
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const PARIS: [number, number] = [2.3488, 48.8534];
const DEFAULT_ZOOM = 12;

// Zoom threshold: below → GL circle layer; at/above → HTML markers
const MARKER_ZOOM = 13;

// Cap on simultaneous HTML markers (closest-to-center priority)
const MAX_MARKERS = 300;

// Scan colors for the GL unclustered-point layer (zoom < MARKER_ZOOM)
const SCAN_COLOR: Record<ScanStatus, string> = {
  scanned:   "#34d399",
  seen:      "#818cf8",
  not_found: "#4a5568",
};

// ── Popup colors (hardcoded for inline styles) ─────────────────────────────
const PC = {
  bg:       "#0e0e1c",
  surface2: "#141428",
  border:   "#1c1c32",
  text:     "#e2e8f0",
  muted:    "#4a5568",
  accent:   "#818cf8",
  success:  "#34d399",
  danger:   "#f87171",
  warning:  "#fb923c",
};
const POPUP_FONT = "var(--font-mono, 'JetBrains Mono', Consolas, monospace)";

// ── Status badge style parser ──────────────────────────────────────────────
function parseInlineBadgeStyle(inlineStr: string): React.CSSProperties {
  const result: React.CSSProperties = {};
  inlineStr.split(";").forEach((part) => {
    const [k, v] = part.split(":").map((s) => s.trim());
    if (!k || !v) return;
    if (k === "background") result.background = v;
    if (k === "color") result.color = v;
  });
  return result;
}

// ── Popup React component ──────────────────────────────────────────────────
interface PopupContentProps {
  id: string;
  status: InvaderStatus;
  isLoggedIn: boolean;
  currentScan: ScanStatus | null;
}

const SCAN_BUTTONS: {
  status: ScanStatus;
  Icon: PhosphorIcon;
  activeColor: string;
  activeBg: string;
}[] = [
  { status: "scanned",   Icon: CheckCircle, activeColor: "#34d399", activeBg: "rgba(52,211,153,0.12)"  },
  { status: "seen",      Icon: Eye,         activeColor: "#818cf8", activeBg: "rgba(129,140,248,0.12)" },
  { status: "not_found", Icon: X,           activeColor: "#f87171", activeBg: "rgba(248,113,113,0.12)" },
];

function PopupContent({ id, status, isLoggedIn, currentScan }: PopupContentProps) {
  const [scan, setScan] = useState<ScanStatus | null>(currentScan);
  const [pending, setPending] = useState(false);

  async function handleScan(s: ScanStatus) {
    if (pending) return;
    setPending(true);
    setScan(s);
    const { error } = await upsertScan(id, s);
    if (!error) useUserStore.getState().setScan(id, s);
    setPending(false);
  }

  const badgeStyle = parseInlineBadgeStyle(
    STATUS_BADGE_INLINE[status] ?? STATUS_BADGE_INLINE["unknown"]
  );

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      style={{
        background: PC.bg,
        border: `1px solid ${PC.border}`,
        borderRadius: "8px",
        padding: "12px",
        fontFamily: POPUP_FONT,
        minWidth: "160px",
        maxWidth: "200px",
        color: PC.text,
        position: "relative",
      }}
    >
      <a
        href={`/invader/${id}`}
        style={{ display: "block", fontWeight: 700, fontSize: "15px", color: PC.accent, textDecoration: "none", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px" }}
      >
        {id}
      </a>
      <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", ...badgeStyle }}>
        {status}
      </span>
      <div style={{ height: "1px", background: PC.border, margin: "8px 0" }} />
      {isLoggedIn ? (
        <div style={{ display: "flex", gap: "6px", justifyContent: "space-between" }}>
          {SCAN_BUTTONS.map(({ status: s, Icon, activeColor, activeBg }) => {
            const active = scan === s;
            return (
              <button
                key={s}
                onClick={() => handleScan(s)}
                disabled={pending}
                style={{
                  flex: 1,
                  height: "36px",
                  borderRadius: "6px",
                  border: "none",
                  background: active ? activeBg : PC.surface2,
                  color: active ? activeColor : PC.muted,
                  cursor: pending ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                  opacity: pending && !active ? 0.5 : 1,
                }}
              >
                <Icon size={16} weight={active ? "fill" : "regular"} color={active ? activeColor : PC.muted} />
              </button>
            );
          })}
        </div>
      ) : (
        <button
          onClick={() => useUserStore.getState().setAuthModalOpen(true)}
          style={{ width: "100%", padding: "6px", border: "none", background: "transparent", color: PC.muted, fontSize: "10px", cursor: "pointer", fontFamily: POPUP_FONT, textAlign: "center", letterSpacing: "0.02em" }}
        >
          se connecter
        </button>
      )}
    </motion.div>
  );
}

// ── Pre-computed base GeoJSON features ─────────────────────────────────────
const allFeatures: GeoJSON.Feature[] = mappableInvaders.map((inv) => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [inv.lng as number, inv.lat as number] },
  properties: {
    id: inv.id,
    city: inv.city,
    status: inv.status,
    points: inv.points,
    hint: inv.hint ?? "",
  },
}));

function computeFilteredGeojson(
  userPosition: [number, number] | null,
  proximityRadius: number,
  proximityActive: boolean,
  statusFilter: StatusFilterKey,
  userScans: Record<string, ScanStatus>
): GeoJSON.FeatureCollection {
  let features = allFeatures;

  const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
  if (allowedStatuses !== null) {
    features = features.filter((f) =>
      allowedStatuses.includes(f.properties!.status as string)
    );
  }

  if (proximityActive && userPosition) {
    features = features.filter((f) => {
      const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates;
      return haversineDistance(userPosition[1], userPosition[0], lat, lng) <= proximityRadius;
    });
  }

  const hasScans = Object.keys(userScans).length > 0;
  if (hasScans) {
    features = features.map((f) => ({
      ...f,
      properties: {
        ...f.properties,
        userScanStatus: userScans[f.properties!.id as string] ?? null,
      },
    }));
  }

  return { type: "FeatureCollection", features };
}

function computeFilteredIds(
  userPosition: [number, number] | null,
  proximityRadius: number,
  proximityActive: boolean,
  statusFilter: StatusFilterKey
): Set<string> {
  let invaders = mappableInvaders;

  const allowedStatuses = STATUS_FILTER_MAP[statusFilter];
  if (allowedStatuses !== null) {
    invaders = invaders.filter((inv) => allowedStatuses.includes(inv.status));
  }

  if (proximityActive && userPosition) {
    invaders = invaders.filter((inv) =>
      haversineDistance(userPosition[1], userPosition[0], inv.lat!, inv.lng!) <= proximityRadius
    );
  }

  return new Set(invaders.map((inv) => inv.id));
}

// ── Component ─────────────────────────────────────────────────────────────
export default function InvaderMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // Active HTML markers (only populated at zoom >= MARKER_ZOOM)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  // IDs passing current status + proximity filter (updated by reactive effect)
  const filteredIdsRef = useRef<Set<string>>(new Set(mappableInvaders.map((i) => i.id)));
  // Stable reference to the viewport marker updater (set after map load)
  const updateMarkersRef = useRef<(() => void) | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  const userPosition = useMapStore((s) => s.userPosition);
  const proximityRadius = useMapStore((s) => s.proximityRadius);
  const proximityActive = useMapStore((s) => s.proximityActive);
  const statusFilter = useMapStore((s) => s.statusFilter);
  const setUserPosition = useMapStore((s) => s.setUserPosition);
  const userScans = useUserStore((s) => s.scans);

  const flyTo = useCallback((center: [number, number], zoom?: number) => {
    mapRef.current?.flyTo({ center, zoom: zoom ?? mapRef.current.getZoom(), duration: 1200 });
  }, []);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos: [number, number] = [coords.longitude, coords.latitude];
        setUserPosition(pos);
        flyTo(pos, 14);
      },
      () => {}
    );
  }, [flyTo, setUserPosition]);

  // ── Reactive: filter / scan changes ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Update GeoJSON source (drives clusters + low-zoom GL circles)
    const source = map.getSource("invaders") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(
        computeFilteredGeojson(userPosition, proximityRadius, proximityActive, statusFilter, userScans)
      );
    }

    // Recompute which IDs pass the filter, then refresh HTML markers
    filteredIdsRef.current = computeFilteredIds(userPosition, proximityRadius, proximityActive, statusFilter);
    updateMarkersRef.current?.();
  }, [userPosition, proximityRadius, proximityActive, statusFilter, userScans]);

  // ── Map initialization ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: PARIS,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      logoPosition: "bottom-left",
    });

    mapRef.current = map;

    map.on("load", () => {
      // ── GeoJSON source ─────────────────────────────────────────────────
      map.addSource("invaders", {
        type: "geojson",
        data: computeFilteredGeojson(
          useMapStore.getState().userPosition,
          useMapStore.getState().proximityRadius,
          useMapStore.getState().proximityActive,
          useMapStore.getState().statusFilter,
          useUserStore.getState().scans
        ),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // ── Cluster layers (all zoom levels) ───────────────────────────────
      map.addLayer({
        id: "clusters-glow",
        type: "circle",
        source: "invaders",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#818cf8",
          "circle-radius": ["interpolate", ["linear"], ["get", "point_count"], 10, 28, 100, 48],
          "circle-blur": 1,
          "circle-opacity": 0.2,
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "invaders",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#818cf8",
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 100, 32, 500, 38],
          "circle-opacity": 0.85,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "invaders",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          // Mapbox GL uses its own bundled font stack — custom web fonts (JetBrains Mono)
          // cannot be used in GL symbol layers. DIN Offc Pro Bold is the closest clean fit.
          "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-letter-spacing": 0,
        },
        paint: { "text-color": "#ffffff" },
      });

      // ── Individual points — GL circles (zoom < MARKER_ZOOM only) ──────
      // Hidden at zoom >= MARKER_ZOOM where HTML markers take over.
      map.addLayer({
        id: "unclustered-point-glow",
        type: "circle",
        source: "invaders",
        filter: ["all", ["!", ["has", "point_count"]], ["<", ["zoom"], MARKER_ZOOM]],
        paint: {
          "circle-color": [
            "match", ["get", "status"],
            "OK",               "#34d399",
            "destroyed",        "#f87171",
            "damaged",          "#fb923c",
            "a little damaged", "#fb923c",
            "very damaged",     "#fb923c",
            "hidden",           "#4a5568",
            "#4a5568",
          ],
          "circle-radius": 14,
          "circle-blur": 1,
          "circle-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "invaders",
        filter: ["all", ["!", ["has", "point_count"]], ["<", ["zoom"], MARKER_ZOOM]],
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "userScanStatus"], "scanned"],   SCAN_COLOR.scanned,
            ["==", ["get", "userScanStatus"], "seen"],      SCAN_COLOR.seen,
            ["==", ["get", "userScanStatus"], "not_found"], SCAN_COLOR.not_found,
            [
              "match", ["get", "status"],
              "OK",               "#34d399",
              "destroyed",        "#f87171",
              "damaged",          "#fb923c",
              "a little damaged", "#fb923c",
              "very damaged",     "#fb923c",
              "hidden",           "#4a5568",
              "#4a5568",
            ],
          ],
          "circle-radius": 5,
          "circle-opacity": [
            "case",
            ["has", "userScanStatus"], 1,
            ["==", ["get", "status"], "destroyed"], 0.4,
            0.9,
          ],
          "circle-stroke-width": 1,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.25,
        },
      });

      // ── Open popup helper ──────────────────────────────────────────────
      function openPopup(inv: (typeof mappableInvaders)[0]) {
        const { user, scans } = useUserStore.getState();
        const container = document.createElement("div");
        const popup = new mapboxgl.Popup({
          closeButton: true,
          maxWidth: "268px",
          className: "invader-popup",
        })
          .setLngLat([inv.lng!, inv.lat!])
          .setDOMContent(container)
          .addTo(map);

        const root = createRoot(container);
        root.render(
          <PopupContent
            id={inv.id}
            status={inv.status}
            isLoggedIn={!!user}
            currentScan={scans[inv.id] ?? null}
          />
        );
        popup.on("close", () => root.unmount());
      }

      // ── HTML marker management (zoom >= MARKER_ZOOM, viewport-bounded) ─
      function updateMarkersForViewport() {
        const zoom = map.getZoom();

        // Below threshold: GL circles are active, HTML markers are removed
        if (zoom < MARKER_ZOOM) {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current.clear();
          return;
        }

        const bounds = map.getBounds();
        const center = map.getCenter();
        const filteredIds = filteredIdsRef.current;
        const scans = useUserStore.getState().scans;

        // Collect invaders within viewport that pass the active filter
        const inBounds = mappableInvaders.filter(
          (inv) => filteredIds.has(inv.id) && bounds?.contains([inv.lng!, inv.lat!])
        );

        // Sort by distance to viewport center, cap at MAX_MARKERS
        const visible = inBounds
          .map((inv) => ({
            inv,
            dist: haversineDistance(center.lat, center.lng, inv.lat!, inv.lng!),
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, MAX_MARKERS)
          .map(({ inv }) => inv);

        const visibleIds = new Set(visible.map((inv) => inv.id));

        // Remove markers that scrolled out of view or no longer pass the filter
        markersRef.current.forEach((marker, id) => {
          if (!visibleIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        });

        // Add new markers; update scan appearance on existing ones
        for (const inv of visible) {
          if (markersRef.current.has(inv.id)) {
            setMarkerScan(markersRef.current.get(inv.id)!.getElement(), scans[inv.id] ?? null);
            continue;
          }

          const el = createMarkerElement(inv.status, scans[inv.id] ?? null);
          el.addEventListener("click", (e) => { e.stopPropagation(); openPopup(inv); });

          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([inv.lng!, inv.lat!])
            .addTo(map);

          markersRef.current.set(inv.id, marker);
        }
      }

      updateMarkersRef.current = updateMarkersForViewport;

      // Fire on every pan/zoom end — handles both viewport changes and zoom crossing
      map.on("moveend", updateMarkersForViewport);

      // ── Click: cluster → zoom in ───────────────────────────────────────
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        if (!features.length) return;
        const clusterId = features[0].properties?.cluster_id as number;
        const src = map.getSource("invaders") as mapboxgl.GeoJSONSource;
        src.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return;
          const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
          map.flyTo({ center: coords, zoom: zoom + 0.5, duration: 600 });
        });
      });

      // ── Click: GL point → popup (only active at zoom < MARKER_ZOOM) ───
      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const id = feature.properties?.id as string;
        const inv = mappableInvaders.find((i) => i.id === id);
        if (inv) openPopup(inv);
      });

      // Cursor pointer for interactive layers
      for (const layer of ["clusters", "unclustered-point"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }

      setMapLoaded(true);
      locateUser();
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      updateMarkersRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [locateUser]);

  return (
    <div className="relative w-full" style={{ height: "100dvh" }}>
      <div ref={containerRef} className="absolute inset-0" />

      {!mapLoaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[--bg]">
          <div className="h-5 w-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="mt-3 text-[10px] text-[--text-muted] uppercase tracking-widest">chargement...</p>
        </div>
      )}

      {mapLoaded && (
        <p className="absolute bottom-[4.5rem] left-2 z-10 text-[9px] text-[--text-muted] pointer-events-none select-none">
          © Mapbox © OSM
        </p>
      )}

      <ProximityButton />
      <StatusFilterBar />

      <button
        onClick={locateUser}
        aria-label="Me localiser"
        className="fixed bottom-[8rem] right-4 z-20 flex h-9 w-9 items-center justify-center rounded bg-[--surface] border border-[--border] text-[--text-muted] shadow-lg transition-colors duration-150 hover:text-[--text] hover:border-[--border-hover]"
      >
        <Crosshair weight="regular" className="h-4 w-4" />
      </button>
    </div>
  );
}
