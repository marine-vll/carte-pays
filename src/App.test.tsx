/**
 * Mirrors `main.tsx`'s real wiring (`GristWidgetProvider` -> `GristBoundary`
 * -> the widget) without importing `main.tsx` itself, so this test exercises
 * the same gate logic the embedded widget actually runs under.
 */
import "@testing-library/jest-dom/vitest"
import { afterEach, describe, expect, it } from "vitest"
import {
  GristBoundary,
  GristWidgetProvider,
  type GristReplicaDocument,
} from "grist-widget-sdk"
import {
  cleanup,
  renderWithGrist,
  screen,
  waitFor,
} from "grist-widget-sdk/emulator/testing"

import App, { GRIST_OPTIONS } from "./App"

afterEach(() => cleanup())

function Wrapped() {
  return (
    <GristWidgetProvider options={GRIST_OPTIONS}>
      <GristBoundary
        gate={GRIST_OPTIONS.columns?.length ? "canRender" : "ready"}
      >
        <App />
      </GristBoundary>
    </GristWidgetProvider>
  )
}

const PAYS_DOCUMENT: GristReplicaDocument = {
  generatedAt: "2024-01-01T00:00:00.000Z",
  docName: "Pays",
  mode: "schema+data",
  tables: {
    PAYS: {
      label: "PAYS",
      columns: {
        pays: { type: "Text", label: "Pays" },
        CSL: { type: "Text", label: "CSL", isFormula: true },
      },
      rows: [
        { id: 1, pays: "France", CSL: "Validé" },
        { id: 2, pays: "Allemagne", CSL: "NA" },
        { id: 3, pays: "Côte d'Ivoire", CSL: "  " },
        { id: 4, pays: "Pays imaginaire", CSL: "NA" },
        { id: 5, pays: "Gabon et Sao Tomé-et-Principe", CSL: "Validé" },
        { id: 6, pays: "CdE Conseil de l'Europe", CSL: "Validé" },
        { id: 7, pays: "ONU", CSL: "NA" },
      ],
    },
  },
}

describe("App", () => {
  it("renders the map, the legend, and the list of unrecognized countries", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL" })

    await waitFor(() => {
      expect(screen.getByText("CSL en cours")).toBeInTheDocument()
      expect(screen.getByText("Pas de fiche")).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Pays non reconnus/)).toBeInTheDocument()
      expect(screen.getByText(/Pays imaginaire/)).toBeInTheDocument()
    })

    await waitFor(() => {
      const titles = Array.from(container.querySelectorAll("title")).map(
        (t) => t.textContent ?? ""
      )
      expect(
        titles.some((t) => t.includes("France") && t.includes("Validé"))
      ).toBe(true)
      expect(
        titles.some(
          (t) => t.includes("Allemagne") && t.includes("Pas de fiche")
        )
      ).toBe(true)
      // Côte d'Ivoire's CSL is blank, not "NA" — still counts as "no fiche".
      expect(
        titles.some(
          (t) => t.includes("Côte d'Ivoire") && t.includes("Pas de fiche")
        )
      ).toBe(true)
    })
  })

  it("colors a matched country green only once its CSL is not blank/NA", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL" })

    await waitFor(() => {
      const franceTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.includes("France")
      )
      expect(franceTitle).toBeTruthy()
      const francePath = franceTitle!.closest("path")
      expect(francePath).toHaveStyle({ fill: "#18753c" })

      const allemagneTitle = Array.from(
        container.querySelectorAll("title")
      ).find((t) => t.textContent?.includes("Allemagne"))
      const allemagnePath = allemagneTitle!.closest("path")
      expect(allemagnePath).toHaveStyle({ fill: "#e5e5e5" })
    })
  })

  it("lights up both countries from a combined entry, and lists organizations separately", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL" })

    // "Gabon et Sao Tomé-et-Principe" is one row covering both countries —
    // both map features should turn green from that single entry.
    await waitFor(() => {
      const gabonTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.startsWith("Gabon et Sao Tomé-et-Principe")
      )
      expect(gabonTitle).toBeTruthy()
      expect(gabonTitle!.closest("path")).toHaveStyle({ fill: "#18753c" })

      const saoTomeTitle = Array.from(container.querySelectorAll("title")).find(
        (t) =>
          t.textContent?.startsWith("Gabon et Sao Tomé-et-Principe") &&
          t.closest("path") !== gabonTitle!.closest("path")
      )
      expect(saoTomeTitle).toBeTruthy()
      expect(saoTomeTitle!.closest("path")).toHaveStyle({ fill: "#18753c" })
    })

    // Non-country entities (including acronyms) render in their own list
    // instead of being flagged as unrecognized.
    await waitFor(() => {
      expect(screen.getByText("Autres entités suivies :")).toBeInTheDocument()
      expect(screen.getByText("Conseil de l'Europe")).toBeInTheDocument()
      expect(
        screen.getByText("Organisation des Nations unies (ONU)")
      ).toBeInTheDocument()

      const unrecognized = screen.getByText(/Pays non reconnus/)
      expect(unrecognized.textContent).not.toContain("Conseil de l'Europe")
      expect(unrecognized.textContent).not.toContain("ONU")
    })
  })
})
