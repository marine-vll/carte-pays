/**
 * Raw row from the "PAYS" table. Keys are the *real* Grist column ids, which
 * depend on how the user mapped them in the widget config panel — resolve
 * them dynamically via `recordsMappings` rather than assuming `pays`/`CSL`.
 */
export type PaysRow = {
  id: number
  [columnId: string]: unknown
}

/** Logical names after column mapping (matches `GRIST_OPTIONS.columns`). */
export type PaysMapped = {
  pays: string
  CSL: string
}
