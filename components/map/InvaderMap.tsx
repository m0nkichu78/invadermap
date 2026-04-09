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
import { createGeoJSONCircle } from "@/lib/map/geoUtils";
import { StatusFilterBar } from "./StatusFilterBar";
import { ProximityButton } from "./ProximityButton";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const SUPABASE_STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/invader-photos`;

const PARIS: [number, number] = [2.3488, 48.8534];
const DEFAULT_ZOOM = 12;
const MARKER_ZOOM = 14;
const MAX_MARKERS = 300;

const SCAN_COLOR: Record<ScanStatus, string> = {
  scanned:   "#34d399",
  seen:      "#f97316",
  not_found: "#4a5568",
};

const PC = {
  bg:       "#0e0e1c",
  surface2: "#141428",
  border:   "#1c1c32",
  text:     "#e2e8f0",
  muted:    "#4a5568",
  accent:   "#f97316",
  success:  "#34d399",
  danger:   "#f87171",
  warning:  "#fb923c",
};
const POPUP_FONT = "var(--font-mono, 'JetBrains Mono', Consolas, monospace)";

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

interface PopupContentProps {
  id: string;
  status: InvaderStatus;
  isLoggedIn: boolean;
  currentScan: ScanStatus | null;
  imageUrl?: string;
}

const SCAN_BUTTONS: {
  status: ScanStatus;
  Icon: PhosphorIcon;
  activeColor: string;
  activeBg: string;
}[] = [
  { status: "scanned",   Icon: CheckCircle, activeColor: "#34d399", activeBg: "rgba(52,211,153,0.12)"  },
  { status: "seen",      Icon: Eye,         activeColor: "#f97316", activeBg: "rgba(249,115,22,0.12)" },
  { status: "not_found", Icon: X,           activeColor: "#f87171", activeBg: "rgba(248,113,113,0.12)" },
];

function PopupContent({ id, status, isLoggedIn, currentScan, imageUrl }: PopupContentProps) {
  const [scan, setScan] = useState<ScanStatus | null>(currentScan);
  const [pending, setPending] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={id}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
            style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, display: imageLoaded ? "block" : "none" }}
          />
        )}
        <div>
          <a
            href={`/invader/${id}`}
            style={{ display: "block", fontWeight: 700, fontSize: "15px", color: PC.accent, textDecoration: "none", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px" }}
          >
            {id}
          </a>
          <span style={{ display: "inline-block", padding: "2px 6px", borderRadius: "3px", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", ...badgeStyle }}>
            {status}
          </span>
        </div>
      </div>
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
                  flex: 1, height: "36px", borderRadius: "6px", border: "none",
                  background: active ? activeBg : PC.surface2,
                  color: active ? activeColor : PC.muted,
                  cursor: pending ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
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

const allFeatures: GeoJSON.Feature[] = mappableInvaders.map((inv) => ({
  type: "Feature",
  geometry: { type: "Point", coordinates: [inv.lng as number, inv.lat as number] },
  properties: { id: inv.id, city: inv.city, status: inv.status, points: inv.points, hint: inv.hint ?? "", image_url: `${SUPABASE_STORAGE}/${inv.city}/${inv.id}.jpg` },
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
    features = features.filter((f) => allowedStatuses.includes(f.properties!.status as string));
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
      properties: { ...f.properties, userScanStatus: userScans[f.properties!.id as string] ?? null },
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

function createUserMarkerElement(): HTMLElement {
  const el = document.createElement("div");
  el.className = "user-marker";
  const pulse = document.createElement("div");
  pulse.className = "user-marker__pulse";
  const dot = document.createElement("div");
  dot.className = "user-marker__dot";
  el.appendChild(pulse);
  el.appendChild(dot);
  return el;
}

interface InvaderMapProps {
  initialLat?: number;
  initialLng?: number;
  initialId?: string;
}

export default function InvaderMap({ initialLat, initialLng, initialId }: InvaderMapProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const filteredIdsRef = useRef<Set<string>>(new Set(mappableInvaders.map((i) => i.id)));
  const updateMarkersRef = useRef<(() => void) | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const pendingFocusRef = useRef<{ lng: number; lat: number; id: string } | null>(
    initialLat !== undefined && initialLng !== undefined
      ? { lat: initialLat, lng: initialLng, id: initialId ?? "" }
      : null
  );

  const [mapLoaded, setMapLoaded] = useState(false);

  const userPosition = useMapStore((s) => s.userPosition);
  const proximityRadius = useMapStore((s) => s.proximityRadius);
  const proximityActive = useMapStore((s) => s.proximityActive);
  const statusFilter = useMapStore((s) => s.statusFilter);
  const lastCenter = useMapStore((s) => s.lastCenter);
  const lastZoom = useMapStore((s) => s.lastZoom);
  const setLastView = useMapStore((s) => s.setLastView);
  const isTracking = useMapStore((s) => s.isTracking);
  const setTracking = useMapStore((s) => s.setTracking);
  const userScans = useUserStore((s) => s.scans);

  // ── Accuracy circle helper ─────────────────────────────────────────────────
  const updateAccuracyCircle = useCallback((map: mapboxgl.Map, lngLat: [number, number], accuracyMeters: number) => {
    const circle = createGeoJSONCircle(lngLat, accuracyMeters);
    const source = map.getSource("user-accuracy") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(circle);
    } else {
      map.addSource("user-accuracy", { type: "geojson", data: circle });
      map.addLayer({
        id: "user-accuracy-fill",
        type: "fill",
        source: "user-accuracy",
        paint: { "fill-color": "#f97316", "fill-opacity": 0.08 },
      });
    }
  }, []);

  // ── Start watching geolocation ─────────────────────────────────────────────
  const startWatch = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current !== null) return; // already watching

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude, accuracy } = coords;
        const lngLat: [number, number] = [longitude, latitude];
        useMapStore.getState().setUserPosition(lngLat);

        const map = mapRef.current;
        if (!map) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat(lngLat);
        } else {
          userMarkerRef.current = new mapboxgl.Marker({
            element: createUserMarkerElement(),
            anchor: "center",
          })
            .setLngLat(lngLat)
            .addTo(map);
        }

        updateAccuracyCircle(map, lngLat, accuracy);

        if (useMapStore.getState().isTracking) {
          map.easeTo({ center: lngLat, duration: 800 });
        }
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [updateAccuracyCircle]);

  // ── Locate button handler ──────────────────────────────────────────────────
  const handleLocate = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isTracking) {
      // Second tap while tracking → stop following
      setTracking(false);
      return;
    }

    // Start watch if not already running
    startWatch();

    const pos = useMapStore.getState().userPosition;
    if (pos) {
      map.flyTo({ center: pos, zoom: 15, duration: 1200 });
    }
    setTracking(true);
  }, [isTracking, setTracking, startWatch]);

  // ── Reactive: filter / scan changes ──────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource("invaders") as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(
        computeFilteredGeojson(userPosition, proximityRadius, proximityActive, statusFilter, userScans)
      );
    }
    filteredIdsRef.current = computeFilteredIds(userPosition, proximityRadius, proximityActive, statusFilter);
    updateMarkersRef.current?.();
  }, [userPosition, proximityRadius, proximityActive, statusFilter, userScans]);

  // ── Map initialization ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Determine initial center/zoom: restore last view, or default to Paris
    const initCenter: [number, number] = lastCenter ?? PARIS;
    const initZoom = lastCenter ? lastZoom : DEFAULT_ZOOM;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initCenter,
      zoom: initZoom,
      attributionControl: false,
      logoPosition: "bottom-left",
    });

    mapRef.current = map;

    map.on("load", () => {
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
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      map.addLayer({
        id: "clusters-glow",
        type: "circle",
        source: "invaders",
        filter: ["all", ["has", "point_count"], ["<", ["zoom"], MARKER_ZOOM]],
        paint: {
          "circle-color": "#f97316",
          "circle-radius": ["interpolate", ["linear"], ["get", "point_count"], 2, 28, 10, 36, 50, 44, 100, 52],
          "circle-blur": 1,
          "circle-opacity": 0.2,
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "invaders",
        filter: ["all", ["has", "point_count"], ["<", ["zoom"], MARKER_ZOOM]],
        paint: {
          "circle-color": "#f97316",
          "circle-radius": ["interpolate", ["linear"], ["get", "point_count"], 2, 18, 10, 26, 50, 34, 100, 42],
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
        filter: ["all", ["has", "point_count"], ["<", ["zoom"], MARKER_ZOOM]],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-letter-spacing": 0,
        },
        paint: { "text-color": "#ffffff" },
      });

      map.addLayer({
        id: "unclustered-point-glow",
        type: "circle",
        source: "invaders",
        filter: ["all", ["!", ["has", "point_count"]], ["<", ["zoom"], MARKER_ZOOM]],
        paint: {
          "circle-color": [
            "match", ["get", "status"],
            "OK", "#34d399", "destroyed", "#f87171",
            "damaged", "#fb923c", "a little damaged", "#fb923c", "very damaged", "#fb923c",
            "hidden", "#4a5568", "#4a5568",
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
            ["==", ["get", "userScanStatus"], "scanned"], SCAN_COLOR.scanned,
            ["==", ["get", "userScanStatus"], "seen"],    SCAN_COLOR.seen,
            ["==", ["get", "userScanStatus"], "not_found"], SCAN_COLOR.not_found,
            [
              "match", ["get", "status"],
              "OK", "#34d399", "destroyed", "#f87171",
              "damaged", "#fb923c", "a little damaged", "#fb923c", "very damaged", "#fb923c",
              "hidden", "#4a5568", "#4a5568",
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
            imageUrl={`${SUPABASE_STORAGE}/${inv.city}/${inv.id}.jpg`}
          />
        );
        popup.on("close", () => root.unmount());
      }

      function updateMarkersForViewport() {
        const zoom = map.getZoom();
        if (zoom < MARKER_ZOOM) {
          markersRef.current.forEach((m) => m.remove());
          markersRef.current.clear();
          return;
        }

        const bounds = map.getBounds();
        const center = map.getCenter();
        const filteredIds = filteredIdsRef.current;
        const scans = useUserStore.getState().scans;

        const inBounds = mappableInvaders.filter(
          (inv) => filteredIds.has(inv.id) && bounds?.contains([inv.lng!, inv.lat!])
        );

        const visible = inBounds
          .map((inv) => ({ inv, dist: haversineDistance(center.lat, center.lng, inv.lat!, inv.lng!) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, MAX_MARKERS)
          .map(({ inv }) => inv);

        const visibleIds = new Set(visible.map((inv) => inv.id));

        markersRef.current.forEach((marker, id) => {
          if (!visibleIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        });

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

      // Update markers on zoom (real-time, so they appear/hide without waiting for zoomend)
      map.on("zoom", () => updateMarkersForViewport());

      // Save last view on every moveend + update markers
      map.on("moveend", () => {
        const c = map.getCenter();
        setLastView([c.lng, c.lat], map.getZoom());
        updateMarkersForViewport();
      });

      // Stop tracking when user manually pans
      map.on("dragstart", () => {
        useMapStore.getState().setTracking(false);
      });

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

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const id = feature.properties?.id as string;
        const inv = mappableInvaders.find((i) => i.id === id);
        if (inv) openPopup(inv);
      });

      for (const layer of ["clusters", "unclustered-point"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }

      setMapLoaded(true);
      updateMarkersForViewport();

      // Handle "Voir sur la carte" navigation
      const pending = pendingFocusRef.current;
      if (pending) {
        map.flyTo({ center: [pending.lng, pending.lat], zoom: 16, duration: 1200 });
        map.once("moveend", () => {
          if (pending.id) {
            const inv = mappableInvaders.find((i) => i.id === pending.id);
            if (inv) openPopup(inv);
          }
          pendingFocusRef.current = null;
        });
      } else {
        startWatch();
      }
    });

    const markers = markersRef.current;
    return () => {
      markers.forEach((m) => m.remove());
      markers.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      updateMarkersRef.current = null;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onClick={handleLocate}
        aria-label="Me localiser"
        className={`fixed bottom-[8rem] right-4 z-20 flex h-9 w-9 items-center justify-center rounded border shadow-lg transition-colors duration-150 ${
          isTracking
            ? "bg-[--accent-dim] border-accent text-accent glow-accent"
            : "bg-[--surface] border-[--border] text-[--text-muted] hover:text-[--text] hover:border-[--border-hover]"
        }`}
      >
        <Crosshair weight={isTracking ? "fill" : "regular"} className="h-4 w-4" />
      </button>
    </div>
  );
}
