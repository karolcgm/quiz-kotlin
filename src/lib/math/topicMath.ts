export function percentPart(base: number, percent: number) {
  return Math.round((base * percent) / 100);
}

export function percentDiscountPrice(base: number, percent: number) {
  return base - percentPart(base, percent);
}

export function percentIncreasePrice(base: number, percent: number) {
  return base + percentPart(base, percent);
}

export function speedFromDistanceTime(distance: number, time: number) {
  return time > 0 ? Math.round((distance / time) * 10) / 10 : 0;
}

export function distanceFromSpeedTime(speed: number, time: number) {
  return Math.round(speed * time * 10) / 10;
}

export function timeFromDistanceSpeed(distance: number, speed: number) {
  return speed > 0 ? Math.round((distance / speed) * 10) / 10 : 0;
}

export function arithmeticMean(values: number[]) {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function mode(values: number[]) {
  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best = values[0] ?? 0;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

export function evaluateExpression(a: number, b: number, c: number, d: number) {
  return a + b * c - d;
}

export function substituteLinear(x: number, a: number, b: number) {
  return a * x + b;
}

export function sumCoefficients(terms: number[]) {
  return terms.reduce((acc, term) => acc + term, 0);
}

export function powerValue(base: number, exponent: number) {
  return base ** exponent;
}

export function linearY(a: number, b: number, x: number) {
  return a * x + b;
}

export function pythagorasHypotenuse(a: number, b: number) {
  return Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
}

export function circleDiameter(radius: number) {
  return radius * 2;
}

export function circleCircumference(radius: number) {
  return Math.round(2 * Math.PI * radius * 10) / 10;
}

export function circleArea(radius: number) {
  return Math.round(Math.PI * radius * radius * 10) / 10;
}

export function cuboidVolume(width: number, height: number, depth: number) {
  return width * height * depth;
}

export function cylinderVolume(radius: number, height: number) {
  return Math.round(Math.PI * radius * radius * height);
}

export function isDivisible(number: number, divisor: number) {
  return number % divisor === 0;
}

export function countMultiplesUpTo(base: number, max: number) {
  return Math.floor(max / base);
}

export function lcm(a: number, b: number) {
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  return (a * b) / gcd(a, b);
}

export function countPrimesUpTo(max: number) {
  let count = 0;
  for (let n = 2; n <= max; n += 1) {
    let prime = true;
    for (let d = 2; d * d <= n; d += 1) {
      if (n % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count += 1;
  }
  return count;
}

export function shapeVertices(shape: "triangle" | "square" | "pentagon" | "hexagon" | "octagon") {
  const map = { triangle: 3, square: 4, pentagon: 5, hexagon: 6, octagon: 8 };
  return map[shape];
}

export function solidCounts(solid: "cube" | "cuboid" | "cylinder") {
  if (solid === "cube") return { faces: 6, edges: 12, vertices: 8 };
  if (solid === "cuboid") return { faces: 6, edges: 12, vertices: 8 };
  return { faces: 3, edges: 2, vertices: 0 };
}

export function countDivisors(number: number) {
  let count = 0;
  for (let d = 1; d <= number; d += 1) {
    if (number % d === 0) count += 1;
  }
  return count;
}

export function triangleArea(base: number, height: number) {
  return Math.round((base * height) / 2);
}

export function trapezoidArea(baseA: number, baseB: number, height: number) {
  return Math.round(((baseA + baseB) * height) / 2);
}

export function parallelogramArea(base: number, height: number) {
  return base * height;
}

export function coordinateDistance(dx: number, dy: number) {
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
}

export function sqrtFromArea(area: number) {
  return Math.round(Math.sqrt(area) * 10) / 10;
}

export function probabilityPercent(favorable: number, total: number) {
  return total > 0 ? Math.round((favorable / total) * 100) : 0;
}
