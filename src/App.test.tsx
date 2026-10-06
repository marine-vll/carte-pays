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
        projetAAP: { type: "Text", label: "Projet AAP" },
      },
      rows: [
        { id: 1, pays: "France", CSL: "Validé", projetAAP: "" },
        { id: 2, pays: "Allemagne", CSL: "NA", projetAAP: "" },
        { id: 3, pays: "Côte d'Ivoire", CSL: "  ", projetAAP: "" },
        { id: 4, pays: "Pays imaginaire", CSL: "NA", projetAAP: "" },
        {
          id: 5,
          pays: "Gabon et Sao Tomé-et-Principe",
          CSL: "Validé",
          projetAAP: "",
        },
        { id: 6, pays: "CdE Conseil de l'Europe", CSL: "Validé", projetAAP: "" },
        { id: 7, pays: "ONU", CSL: "NA", projetAAP: "" },
        { id: 8, pays: "Italie", CSL: "Validé", projetAAP: "Appel 2026" },
        { id: 9, pays: "Japon", CSL: "NA", projetAAP: "Appel 2027" },
        { id: 10, pays: "Polynésie française", CSL: "NA", projetAAP: "" },
      ],
    },
  },
}

describe("App", () => {
  it("renders the map, the legend, and the list of unrecognized countries", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL", projetAAP: "projetAAP" })

    await waitFor(() => {
      expect(screen.getByText("CSL actif")).toBeInTheDocument()
      expect(screen.getByText("NA")).toBeInTheDocument()
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
        titles.some((t) => t.includes("Allemagne") && t.includes("NA"))
      ).toBe(true)
      // Côte d'Ivoire's CSL is blank, not "NA" — still counts as "no fiche".
      expect(
        titles.some((t) => t.includes("Côte d'Ivoire") && t.includes("NA"))
      ).toBe(true)
    })
  })

  it("colors a matched country green only once its CSL is not blank/NA", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL", projetAAP: "projetAAP" })

    await waitFor(() => {
      const gabonTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.startsWith("Gabon et Sao Tomé-et-Principe")
      )
      expect(gabonTitle).toBeTruthy()
      expect(gabonTitle!.closest("path")).toHaveStyle({ fill: "#18753c" })

      const allemagneTitle = Array.from(
        container.querySelectorAll("title")
      ).find((t) => t.textContent?.includes("Allemagne"))
      const allemagnePath = allemagneTitle!.closest("path")
      expect(allemagnePath).toHaveStyle({ fill: "#e5e5e5" })
    })
  })

  it("always renders mainland France dark grey, even with an active CSL", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL", projetAAP: "projetAAP" })

    await waitFor(() => {
      const franceTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.startsWith("France —")
      )
      expect(franceTitle).toBeTruthy()
      expect(franceTitle!.textContent).toContain("Validé")
      expect(franceTitle!.closest("path")).toHaveStyle({ fill: "#6a6a6a" })
    })
  })

  it("lights up both countries from a combined entry, and lists organizations separately", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({ pays: "pays", CSL: "CSL", projetAAP: "projetAAP" })

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

  it("colors by Projet AAP, blends both as stripes, and forces French territories dark grey", async () => {
    const { container, emulator } = renderWithGrist(<Wrapped />, {
      emulator: { document: PAYS_DOCUMENT },
    })
    emulator.setColumnMappings({
      pays: "pays",
      CSL: "CSL",
      projetAAP: "projetAAP",
    })

    await waitFor(() => {
      // Japon: no CSL but a Projet AAP entry — blue only.
      const japonTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.includes("Japon")
      )
      expect(japonTitle).toBeTruthy()
      expect(japonTitle!.textContent).toContain("Projet en cours")
      expect(japonTitle!.closest("path")).toHaveStyle({ fill: "#adbed3" })

      // Italie: both a CSL and a Projet AAP entry — striped pattern fill.
      const italieTitle = Array.from(container.querySelectorAll("title")).find(
        (t) => t.textContent?.includes("Italie")
      )
      expect(italieTitle).toBeTruthy()
      expect(italieTitle!.textContent).toContain("CSL actif")
      expect(italieTitle!.textContent).toContain("Projet en cours")
      expect(italieTitle!.closest("path")).toHaveStyle({
        fill: "url(#csl-and-projet-aap)",
      })

      // Polynésie française: always dark grey, regardless of its own status.
      const polynesieTitle = Array.from(
        container.querySelectorAll("title")
      ).find((t) => t.textContent?.includes("Polynésie française"))
      expect(polynesieTitle).toBeTruthy()
      expect(polynesieTitle!.textContent).toContain("France")
      expect(polynesieTitle!.closest("path")).toHaveStyle({ fill: "#6a6a6a" })
    })

    // 6 distinct map features are tracked once France and Polynésie
    // française are excluded: Allemagne, Côte d'Ivoire, Gabon,
    // Sao Tomé-et-Principe, Italie, Japon. 3 of those 6 have an active
    // CSL (Gabon, Sao Tomé-et-Principe, Italie) — round(3/6*100) = 50.
    await waitFor(() => {
      expect(screen.getByText("50%")).toBeInTheDocument()
      expect(
        screen.getByText(/de postes nous ont signalé leur CSL/)
      ).toBeInTheDocument()
    })
  })
})
