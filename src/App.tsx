import { useMemo, useState, type ReactNode } from "react"
import type { GeoJsonObject } from "geojson"
import { Minus, Plus } from "lucide-react"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps"

import {
  useGrist,
  useWidgetMetadata,
  type UseGristOptions,
  type UseGristResult,
} from "grist-widget-sdk"

import { Button } from "@/components/ui/button"
import worldTopologyJson from "@/data/world-countries-50m.json"
import {
  FRENCH_TERRITORY_KEYS,
  resolveCountryKeys,
  resolveOrganizationName,
} from "@/lib/country-name-to-iso"

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
    {
      name: "projetAAP",
      title: "Projet AAP",
      description:
        "Un pays passe en bleu dès que cette colonne contient une valeur.",
      optional: true,
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
const TERRITORY_FILL = "#6a6a6a"
const BORDER_COLOR = "#ffffff"
const ACCENT_GREEN = "#18753c"
// Pantone 14-4112 TCX "Skyway"
const ACCENT_BLUE = "#adbed3"
const STRIPE_PATTERN_ID = "csl-and-projet-aap"

type CountryStatus = {
  /** Country name exactly as entered in the Grist table. */
  pays: string
  csl: string
  hasFiche: boolean
  hasProject: boolean
}

type OrganizationStatus = {
  name: string
  hasFiche: boolean
  hasProject: boolean
}

type CountryData = {
  byKey: Map<string, CountryStatus>
  unrecognized: string[]
  organizations: OrganizationStatus[]
  /** % of (non-territory) tracked countries with a launched CSL, or null with nothing tracked yet. */
  cslPercentage: number | null
  loaded: boolean
}

function hasFiche(csl: string): boolean {
  const trimmed = csl.trim()
  return trimmed !== "" && trimmed.toUpperCase() !== "NA"
}

/** True when a cell is meaningfully filled in — used for the "Projet AAP" column. */
function hasValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value !== 0
  if (typeof value === "string") return value.trim() !== ""
  if (Array.isArray(value)) return value.length > 0
  return true
}

function useCountryData(w: PaysGrist): CountryData {
  const rows = w.records
  const mappings = w.recordsMappings

  return useMemo(() => {
    const byKey = new Map<string, CountryStatus>()
    const unrecognized: string[] = []
    const orgByName = new Map<
      string,
      { hasFiche: boolean; hasProject: boolean }
    >()

    const paysCol = typeof mappings?.pays === "string" ? mappings.pays : null
    const cslCol = typeof mappings?.CSL === "string" ? mappings.CSL : null
    const projetCol =
      typeof mappings?.projetAAP === "string" ? mappings.projetAAP : null
    if (!paysCol || !cslCol || !rows) {
      return {
        byKey,
        unrecognized,
        organizations: [],
        cslPercentage: null,
        loaded: rows != null,
      }
    }

    for (const row of rows) {
      const pays = row[paysCol]
      if (typeof pays !== "string" || !pays.trim()) continue
      const csl = typeof row[cslCol] === "string" ? (row[cslCol] as string) : ""
      const project = projetCol ? hasValue(row[projetCol]) : false
      const keys = resolveCountryKeys(pays)
      if (keys.length === 0) {
        const orgName = resolveOrganizationName(pays)
        if (orgName) {
          const existing = orgByName.get(orgName) ?? {
            hasFiche: false,
            hasProject: false,
          }
          orgByName.set(orgName, {
            hasFiche: existing.hasFiche || hasFiche(csl),
            hasProject: existing.hasProject || project,
          })
        } else {
          unrecognized.push(pays)
        }
        continue
      }
      // A combined entry (e.g. "Gabon et Sao Tomé-et-Principe") resolves to
      // more than one key — both map features share this row's status.
      const status: CountryStatus = {
        pays,
        csl,
        hasFiche: hasFiche(csl),
        hasProject: project,
      }
      for (const key of keys) byKey.set(key, status)
    }
    unrecognized.sort((a, b) => a.localeCompare(b, "fr"))
    const organizations = Array.from(orgByName, ([name, status]) => ({
      name,
      ...status,
    })).sort((a, b) => a.name.localeCompare(b.name, "fr"))

    const trackedCountries = Array.from(byKey.entries()).filter(
      ([key]) => !FRENCH_TERRITORY_KEYS.has(key)
    )
    const cslPercentage =
      trackedCountries.length > 0
        ? Math.round(
            (trackedCountries.filter(([, status]) => status.hasFiche).length /
              trackedCountries.length) *
              100
          )
        : null

    return { byKey, unrecognized, organizations, cslPercentage, loaded: true }
  }, [rows, mappings])
}

const MAP_WIDTH = 960
const MAP_HEIGHT = 520
const MIN_ZOOM = 1
const MAX_ZOOM = 8
const DEFAULT_CENTER: [number, number] = [12, 8]

type MapPosition = { coordinates: [number, number]; zoom: number }

const DEFAULT_POSITION: MapPosition = {
  coordinates: DEFAULT_CENTER,
  zoom: MIN_ZOOM,
}

function fillFor(
  status: CountryStatus | undefined,
  isFrenchTerritory: boolean
): string {
  if (isFrenchTerritory) return TERRITORY_FILL
  if (!status) return NEUTRAL_FILL
  if (status.hasFiche && status.hasProject) return `url(#${STRIPE_PATTERN_ID})`
  if (status.hasFiche) return ACCENT_GREEN
  if (status.hasProject) return ACCENT_BLUE
  return NEUTRAL_FILL
}

function describeStatus(
  status: CountryStatus | undefined,
  mapName: string,
  isFrenchTerritory: boolean
): string {
  const name = status?.pays ?? mapName
  const parts: string[] = []
  if (status?.hasFiche) parts.push(`CSL lancé (${status.csl})`)
  if (status?.hasProject) parts.push("Projet en cours")
  if (isFrenchTerritory) parts.push("Territoire français")
  if (parts.length === 0) return status ? `${name} — NA` : name
  return `${name} — ${parts.join(" · ")}`
}

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
        <defs>
          <pattern
            id={STRIPE_PATTERN_ID}
            patternUnits="userSpaceOnUse"
            width={6}
            height={6}
            patternTransform="rotate(45)"
          >
            <rect width={6} height={6} fill={ACCENT_GREEN} />
            <rect width={3} height={6} fill={ACCENT_BLUE} />
          </pattern>
        </defs>
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
                  typeof geo.properties?.name === "string"
                    ? geo.properties.name
                    : ""
                const key =
                  geo.id != null ? String(geo.id) : mapName || undefined
                const status = key ? byKey.get(key) : undefined
                const isFrenchTerritory = key
                  ? FRENCH_TERRITORY_KEYS.has(key)
                  : false
                const fill = fillFor(status, isFrenchTerritory)
                const tooltip = describeStatus(
                  status,
                  mapName,
                  isFrenchTerritory
                )

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
      {/* Explicit colors, not Tailwind theme tokens (bg-background,
          border-border, ...): those resolve against CSS variables set by
          ThemeProvider, which doesn't reliably pick up a theme once this
          widget is actually embedded inside Grist — leaving the toolbar
          transparent/invisible there even though it renders fine in dev
          and in tests. The rest of the map already avoids this by using
          literal hex values (NEUTRAL_FILL, ACCENT_GREEN, ...). */}
      <div
        className="absolute top-2 right-2 flex overflow-hidden rounded-md shadow-sm"
        style={{ backgroundColor: "#ffffff", border: "1px solid #c7c7c7" }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-none hover:bg-black/5"
          style={{ color: "#1f2937", borderRight: "1px solid #c7c7c7" }}
          aria-label="Zoomer"
          onClick={() => zoomBy(1.5)}
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="rounded-none hover:bg-black/5"
          style={{ color: "#1f2937" }}
          aria-label="Dézoomer"
          onClick={() => zoomBy(1 / 1.5)}
        >
          <Minus />
        </Button>
      </div>
    </div>
  )
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-3 rounded-sm border border-border"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}

const LEGEND_STRIPE_PATTERN_ID = "legend-csl-and-projet-aap"

/** A `<pattern>` fill only resolves against elements in the same SVG, so the
 * legend gets its own tiny standalone swatch rather than reusing the map's. */
function StripedSwatch() {
  return (
    <svg
      viewBox="0 0 12 12"
      className="size-3 rounded-sm border border-border"
      aria-hidden
    >
      <defs>
        <pattern
          id={LEGEND_STRIPE_PATTERN_ID}
          patternUnits="userSpaceOnUse"
          width={4}
          height={4}
          patternTransform="rotate(45)"
        >
          <rect width={4} height={4} fill={ACCENT_GREEN} />
          <rect width={2} height={4} fill={ACCENT_BLUE} />
        </pattern>
      </defs>
      <rect width={12} height={12} fill={`url(#${LEGEND_STRIPE_PATTERN_ID})`} />
    </svg>
  )
}

function LegendSwatch({ label, swatch }: { label: string; swatch: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <LegendSwatch
        label="CSL lancé"
        swatch={<ColorSwatch color={ACCENT_GREEN} />}
      />
      <LegendSwatch
        label="Projet en cours"
        swatch={<ColorSwatch color={ACCENT_BLUE} />}
      />
      <LegendSwatch
        label="CSL lancé et projet en cours"
        swatch={<StripedSwatch />}
      />
      <LegendSwatch label="NA" swatch={<ColorSwatch color={NEUTRAL_FILL} />} />
      <LegendSwatch
        label="Territoire français"
        swatch={<ColorSwatch color={TERRITORY_FILL} />}
      />
    </div>
  )
}

/** Dots are too small for a striped "both" state — green takes priority. */
function dotColorFor(org: OrganizationStatus): string {
  if (org.hasFiche) return ACCENT_GREEN
  if (org.hasProject) return ACCENT_BLUE
  return NEUTRAL_FILL
}

function describeOrganization(org: OrganizationStatus): string {
  const parts: string[] = []
  if (org.hasFiche) parts.push("CSL lancé")
  if (org.hasProject) parts.push("Projet en cours")
  return parts.length > 0 ? parts.join(" · ") : "NA"
}

function OrganizationList({
  organizations,
}: {
  organizations: OrganizationStatus[]
}) {
  if (organizations.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        Autres entités suivies :
      </span>
      {organizations.map((org) => (
        <span
          key={org.name}
          className="flex items-center gap-1.5"
          title={describeOrganization(org)}
        >
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: dotColorFor(org) }}
            aria-hidden
          />
          {org.name}
        </span>
      ))}
    </div>
  )
}

export function App() {
  useWidgetMetadata(WIDGET_METADATA)

  const w = useGrist<PaysRow, PaysMapped>()
  const { byKey, unrecognized, organizations, cslPercentage, loaded } =
    useCountryData(w)

  if (!loaded) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Chargement des pays…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <WorldMap byKey={byKey} />
      <Legend />
      {cslPercentage != null ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{cslPercentage}%</span>{" "}
          des pays suivis ont un CSL lancé
        </p>
      ) : null}
      <OrganizationList organizations={organizations} />
      {unrecognized.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Pays non reconnus : {unrecognized.join(", ")}
        </p>
      ) : null}
    </div>
  )
}

export default App
