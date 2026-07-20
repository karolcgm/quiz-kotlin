export {
  DECIMAL_PLACES,
  DECIMAL_UNITS,
  addDecimalValues,
  areEquivalentDecimals,
  buildDecimalWrittenAddSubModel,
  buildDecimalWrittenDivideModel,
  buildDecimalWrittenMultiplyModel,
  compareDecimalValues,
  convertDecimalUnit,
  decimalInputFromPlaceState,
  decimalPlaceStateFromInput,
  divideDecimalValues,
  formatDecimal,
  multiplyDecimalValues,
  normalizeDecimalUnit,
  parseDecimalInput,
  scaleDecimalByPower10,
  subtractDecimalValues,
} from "@/lib/math/decimals/decimalMath";
export { createDecimalDiagnosticResult, decimalDiagnosticCopy, decimalDiagnosticHighlights } from "@/lib/math/decimals/decimalDiagnostics";
export {
  DECIMAL_NOTATION_L1_GENERATOR_ID,
  DECIMAL_NOTATION_L1_SKILL_ID,
  createPublicDecimalNotationL1Task,
  decimalHundredthsDisplay,
  decimalHundredthsWords,
  decimalNotationL1ActivityFromStageId,
} from "@/lib/math/decimals/decimalNotationL1";
export type {
  DecimalNotationL1Activity,
  DecimalNotationL1PublicTask,
} from "@/lib/math/decimals/decimalNotationL1";
export {
  createPublicDecimalNaturalDivideL1Task,
  isDecimalNaturalDivideL1Activity,
  validateDecimalNaturalDivideL1Answer,
} from "@/lib/math/decimals/decimalNaturalDivideL1";
export type { DecimalNaturalDivideL1Activity, DecimalNaturalDivideL1Task } from "@/lib/math/decimals/decimalNaturalDivideL1";
