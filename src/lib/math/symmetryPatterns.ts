export type SymmetryMotif = "butterfly" | "house" | "heart";

export type SymmetryAxisShape = "square" | "rectangle";

const motifLeftCells: Record<SymmetryMotif, string[]> = {
  butterfly: ["0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,2", "3,1", "4,0", "4,1", "4,2"],
  house: ["0,2", "1,1", "1,2", "2,0", "2,1", "2,2", "3,0", "3,1", "3,2", "4,1", "4,2"],
  heart: ["0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2", "3,1", "3,2"],
};

export const SYMMETRY_GRID = { rows: 5, cols: 6, axisCol: 3 };

export function motifLeftHalf(motif: SymmetryMotif): string[] {
  return motifLeftCells[motif];
}

export function mirrorCellKey(key: string, axisCol: number, cols: number): string {
  const [row, col] = key.split(",").map(Number);
  const mirrorCol = cols - 1 - col;
  return `${row},${mirrorCol}`;
}

export function expectedMirrorCells(motif: SymmetryMotif): string[] {
  const { axisCol, cols } = SYMMETRY_GRID;
  return motifLeftHalf(motif)
    .filter((key) => {
      const col = Number(key.split(",")[1]);
      return col < axisCol;
    })
    .map((key) => mirrorCellKey(key, axisCol, cols));
}

export function parseCellKey(key: string) {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

export function isAxisSymmetric(shape: SymmetryAxisShape, axisPercent: number): boolean {
  const center = 50;
  const tolerance = shape === "square" ? 4 : 6;
  return Math.abs(axisPercent - center) <= tolerance;
}

export function randomMotif(): SymmetryMotif {
  const motifs: SymmetryMotif[] = ["butterfly", "house", "heart"];
  return motifs[Math.floor(Math.random() * motifs.length)];
}
