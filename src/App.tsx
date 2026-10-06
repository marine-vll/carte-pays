import { useMemo, useState } from "react"
import type { GeoJsonObject } from "geojson"
import { Minus, Plus, RotateCcw } from "lucide-react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"

import {
  useGrist,
  useWidgetMetadata,
  type UseGristOptions,
  type UseGristResult,
} from "grist-widget-sdk"

import { Button } from "@/components/ui/button"
import worldTopologyJson from "@/data/world-countries-50m.json"
import { resolveCountryKey } from "@/lib/country-name-to-iso"

import type { PaysMapped, PaysRow } from "./grist-types"

// react-simple-maps accepts a raw TopoJSON `Topology` at runtime (it derives
// GeoJSON features from it internally), but its own types only declare plain
// GeoJSON input — hence the cast.
const worldTopology = worldTopologyJson as unknown as GeoJsonObject

export const GRIST_OPTIONS: UseGristOptions = {
  requiredAccess: "read table",
  columns: [
    { name: "pays", title: "Pays", description: "Nom du pays." },
    {
      name: "CSL",
      title: "CSL",
      description:
        'Statut de la dernière fiche CSL (colonne formule, lecture seule). Vaut "NA" si aucune fiche datée.',
    },
  ],
  // This widget always shows every row of its table — it never expects a
  // selector to drive it, so the "section not linked" callout (titled
  // "Widget linking") would only ever be noise here.
  suppressAlerts: ["section-not-linked"],
}

export const WIDGET_METADATA = {
  title: "Carte Pays",
  description:
    "Planisphère : un pays apparaît en vert dès qu'une fiche CSL a été créée pour lui.",
} as const

type PaysGrist = UseGristResult<PaysRow, PaysMapped>

const NEUTRAL_FILL = "#e5e5e5"
const BORDER_COLOR = "#ffffff"
const ACCENT_GREEN = "#18753c"

type CountryStatus = {
  /** Country name exactly as entered in the Grist table. */
  pays: string
  csl: string
  hasFiche: boolean
}

type CountryData = {
  byKey: Map<string, CountryStatus>
  unrecognized: string[]
  loaded: boolean
}

function hasFiche(csl: string): boolean {
  const trimmed = csl.trim()
  return trimmed !== "" && trimmed.toUpperCase() !== "NA"
}

function useCountryData(w: PaysGrist): CountryData {
  const rows = w.records
  const mappings = w.recordsMappings

  return useMemo(() => {
    const byKey = new Map<string, CountryStatus>()
    const unrecognized: string[] = []

    const paysCol = typeof mappings?.pays === "string" ? mappings.pays : null
    const cslCol = typeof mappings?.CSL === "string" ? mappings.CSL : null
    if (!paysCol || !cslCol || !rows) {
      return { byKey, unrecognized, loaded: rows != null }
    }

    for (const row of rows) {
      const pays = row[paysCol]
      if (typeof pays !== "string" || !pays.trim()) continue
      const csl = typeof row[cslCol] === "string" ? (row[cslCol] as string) : ""
      const key = resolveCountryKey(pays)
      if (!key) {
        unrecognized.push(pays)
        continue
      }
      byKey.set(key, { pays, csl, hasFiche: hasFiche(csl) })
    }
    unrecognized.sort((a, b) => a.localeCompare(b, "fr"))
    return { byKey, unrecognized, loaded: true }
  }, [rows, mappings])
}

const MAP_WIDTH = 960
const MAP_HEIGHT = 520
const MIN_ZOOM = 1
const MAX_ZOOM = 8
const DEFAULT_CENTER: [number, number] = [12, 8]

type MapPosition = { coordinates: [number, number]; zoom: number }

const DEFAULT_POSITION: MapPosition = { coordinates: DEFAULT_CENTER, zoom: MIN_ZOOM }

function WorldMap({ byKey }: { byKey: Map<string, CountryStatus> }) {
  const [position, setPosition] = useState<MapPosition>(DEFAULT_POSITION)

  function handleMoveEnd({
    coordinates,
    zoom,
  }: {
    coordinates?: [number, number]
    zoom?: number
  }) {
    setPosition((prev) => ({
      coordinates: coordinates ?? prev.coordinates,
      zoom: zoom ?? prev.zoom,
    }))
  }

  function zoomBy(factor: number) {
    setPosition((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor)),
    }))
  }

  return (
    <div className="relative">
      <ComposableMap
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        projectionConfig={{ scale: 150 }}
        className="aspect-[960/520] w-full"
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          translateExtent={[
            [0, 0],
            [MAP_WIDTH, MAP_HEIGHT],
          ]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={worldTopology}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const mapName =
                  typeof geo.properties?.name === "string" ? geo.properties.name : ""
                const key = geo.id != null ? String(geo.id) : mapName || undefined
                const status = key ? byKey.get(key) : undefined
                const fill = status?.hasFiche ? ACCENT_GREEN : NEUTRAL_FILL
                const tooltip = status
                  ? `${status.pays} — ${
                      status.hasFiche ? `Fiche créée (${status.csl})` : "Pas de fiche"
                    }`
                  : mapName

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    vectorEffect="non-scaling-stroke"
                    style={{ fill, stroke: BORDER_COLOR, strokeWidth: 0.5 }}
                  >
                    {tooltip ? <title>{tooltip}</title> : null}
                  </Geography>
                )
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Zoomer"
          onClick={() => zoomBy(1.5)}
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Dézoomer"
          onClick={() => zoomBy(1 / 1.5)}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Réinitialiser le zoom"
          onClick={() => setPosition(DEFAULT_POSITION)}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block size-3 rounded-sm"
          style={{ backgroundColor: ACCENT_GREEN }}
          aria-hidden
        />
        Fiche créée
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="inline-block size-3 rounded-sm border border-border"
          style={{ backgroundColor: NEUTRAL_FILL }}
          aria-hidden
        />
        Pas de fiche
      </span>
    </div>
  )
}

export function App() {
  useWidgetMetadata(WIDGET_METADATA)

  const w = useGrist<PaysRow, PaysMapped>()
  const { byKey, unrecognized, loaded } = useCountryData(w)

  if (!loaded) {
    return <div className="p-6 text-sm text-muted-foreground">Chargement des pays…</div>
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <WorldMap byKey={byKey} />
      <Legend />
      {unrecognized.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Pays non reconnus : {unrecognized.join(", ")}
        </p>
      ) : null}
    </div>
  )
}

export default App
