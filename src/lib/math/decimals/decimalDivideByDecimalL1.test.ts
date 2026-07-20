import { describe, expect, it } from "vitest";
import { shiftDecimalCommaRight } from "@/lib/math/decimals/decimalDivideByDecimalL1";
describe("dzielenie przez ułamek dziesiętny", () => { it("przesuwa przecinek w obu liczbach i dopisuje zera", () => { expect(shiftDecimalCommaRight("4,5", 2)).toBe("450"); expect(shiftDecimalCommaRight("0,15", 2)).toBe("15"); expect(shiftDecimalCommaRight("6", 1)).toBe("60"); }); });
