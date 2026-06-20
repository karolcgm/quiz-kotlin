export interface FactorTreeNode {
  value: number;
  left?: FactorTreeNode;
  right?: FactorTreeNode;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let d = 3; d * d <= n; d += 2) {
    if (n % d === 0) return false;
  }
  return true;
}

export function primeFactorize(n: number): number[] {
  if (n < 2) return [];
  const factors: number[] = [];
  let value = n;
  let divisor = 2;

  while (divisor * divisor <= value) {
    while (value % divisor === 0) {
      factors.push(divisor);
      value /= divisor;
    }
    divisor += divisor === 2 ? 1 : 2;
  }

  if (value > 1) {
    factors.push(value);
  }

  return factors;
}

export function properDivisors(n: number): number[] {
  const divisors: number[] = [];
  for (let d = 2; d < n; d += 1) {
    if (n % d === 0) {
      divisors.push(d);
    }
  }
  return divisors;
}

export function sameFactorMultiset(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);
  return left.every((value, index) => value === right[index]);
}

export function factorsToLabel(factors: number[]): string {
  return [...factors].sort((a, b) => a - b).join("|");
}

export function labelToFactors(label: string): number[] {
  if (!label) return [];
  return label.split("|").map((part) => Number.parseInt(part, 10)).filter((n) => Number.isFinite(n));
}

export function collectPrimeLeaves(node: FactorTreeNode): number[] | null {
  if (!node.left && !node.right) {
    return isPrime(node.value) ? [node.value] : null;
  }

  if (!node.left || !node.right) {
    return null;
  }

  const leftLeaves = collectPrimeLeaves(node.left);
  const rightLeaves = collectPrimeLeaves(node.right);

  if (!leftLeaves || !rightLeaves) {
    return null;
  }

  return [...leftLeaves, ...rightLeaves];
}

export function buildCanonicalTree(n: number): FactorTreeNode {
  if (isPrime(n)) {
    return { value: n };
  }

  const smallestPrime = primeFactorize(n)[0];
  return {
    value: n,
    left: { value: smallestPrime },
    right: buildCanonicalTree(n / smallestPrime),
  };
}

export type FactorTreePath = ("left" | "right")[];

export function getNodeAt(tree: FactorTreeNode, path: FactorTreePath): FactorTreeNode {
  let current = tree;
  for (const step of path) {
    current = step === "left" ? current.left! : current.right!;
  }
  return current;
}

export function splitNodeAt(tree: FactorTreeNode, path: FactorTreePath, divisor: number): FactorTreeNode {
  if (path.length === 0) {
    const node = tree;
    if (node.left || node.right || node.value % divisor !== 0 || divisor <= 1 || divisor >= node.value) {
      return tree;
    }
    return {
      value: node.value,
      left: { value: divisor },
      right: { value: node.value / divisor },
    };
  }

  const [step, ...rest] = path;
  if (step === "left" && tree.left) {
    return { ...tree, left: splitNodeAt(tree.left, rest, divisor) };
  }
  if (step === "right" && tree.right) {
    return { ...tree, right: splitNodeAt(tree.right, rest, divisor) };
  }
  return tree;
}

export function findFirstSplittablePath(tree: FactorTreeNode, path: FactorTreePath = []): FactorTreePath | null {
  if (!tree.left && !tree.right && !isPrime(tree.value) && tree.value > 1) {
    return path;
  }

  if (tree.left) {
    const leftPath = findFirstSplittablePath(tree.left, [...path, "left"]);
    if (leftPath) return leftPath;
  }

  if (tree.right) {
    const rightPath = findFirstSplittablePath(tree.right, [...path, "right"]);
    if (rightPath) return rightPath;
  }

  return null;
}

export interface TreeLayoutNode {
  node: FactorTreeNode;
  path: FactorTreePath;
  x: number;
  y: number;
}

export function layoutTreeWithPath(root: FactorTreeNode, pathPrefix: FactorTreePath = [], depth = 0, x = 0, spacing = 64): {
  layouts: TreeLayoutNode[];
  width: number;
} {
  function walk(node: FactorTreeNode, prefix: FactorTreePath, level: number, startX: number): { layouts: TreeLayoutNode[]; nextX: number } {
    const y = level * 90 + 36;

    if (!node.left && !node.right) {
      return {
        layouts: [{ node, path: prefix, x: startX, y }],
        nextX: startX + spacing,
      };
    }

    let cursor = startX;
    const childLayouts: TreeLayoutNode[] = [];

    if (node.left) {
      const left = walk(node.left, [...prefix, "left"], level + 1, cursor);
      childLayouts.push(...left.layouts);
      cursor = left.nextX;
    }

    if (node.right) {
      const right = walk(node.right, [...prefix, "right"], level + 1, cursor);
      childLayouts.push(...right.layouts);
      cursor = right.nextX;
    }

    const parentX =
      childLayouts.length > 0
        ? (childLayouts[0].x + childLayouts[childLayouts.length - 1].x) / 2
        : startX;

    return {
      layouts: [{ node, path: prefix, x: parentX, y }, ...childLayouts],
      nextX: Math.max(cursor, startX + spacing),
    };
  }

  const result = walk(root, pathPrefix, depth, x);
  const maxX = result.layouts.reduce((max, item) => Math.max(max, item.x), 0);
  return { layouts: result.layouts, width: maxX + spacing + 40 };
}

export function pathKey(path: FactorTreePath): string {
  return path.length === 0 ? "root" : path.join(".");
}

export function parsePathKey(key: string): FactorTreePath {
  if (key === "root") return [];
  return key.split(".").map((step) => (step === "left" ? "left" : "right"));
}

export const COMPOSITE_NUMBERS = [
  12, 14, 15, 18, 20, 21, 24, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 72, 80, 84, 90, 96, 100,
];
