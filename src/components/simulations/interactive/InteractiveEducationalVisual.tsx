"use client";

import { InteractiveArithmeticVisual } from "@/components/simulations/interactive/InteractiveArithmeticVisual";
import { InteractiveComparisonVisual } from "@/components/simulations/interactive/InteractiveComparisonVisual";
import { InteractiveFallbackVisual } from "@/components/simulations/interactive/InteractiveFallbackVisual";
import { InteractiveFractionVisual } from "@/components/simulations/interactive/InteractiveFractionVisual";
import { InteractiveFractionNumberLineVisual } from "@/components/simulations/interactive/InteractiveFractionNumberLineVisual";
import { InteractiveLiczmanyVisual } from "@/components/simulations/interactive/InteractiveLiczmanyVisual";
import { InteractiveNumberBondVisual } from "@/components/simulations/interactive/InteractiveNumberBondVisual";
import { InteractiveNumberLineVisual } from "@/components/simulations/interactive/InteractiveNumberLineVisual";
import { InteractivePrimeFactorTreeVisual } from "@/components/simulations/interactive/InteractivePrimeFactorTreeVisual";
import { InteractivePolygonVisual } from "@/components/simulations/interactive/InteractivePolygonVisual";
import { InteractiveRatioVisual } from "@/components/simulations/interactive/InteractiveRatioVisual";
import { InteractiveRectangleVisual } from "@/components/simulations/interactive/InteractiveRectangleVisual";
import { InteractiveClockVisual } from "@/components/simulations/interactive/InteractiveClockVisual";
import { InteractiveShapeSortVisual } from "@/components/simulations/interactive/InteractiveShapeSortVisual";
import { InteractiveSymmetryVisual } from "@/components/simulations/interactive/InteractiveSymmetryVisual";
import { InteractiveAngleKindsVisual } from "@/components/simulations/interactive/InteractiveAngleKindsVisual";
import { InteractiveIntersectingAnglesVisual } from "@/components/simulations/interactive/InteractiveIntersectingAnglesVisual";
import { InteractiveTriangleAngleSumVisual } from "@/components/simulations/interactive/InteractiveTriangleAngleSumVisual";
import { InteractiveTriangleClassificationVisual } from "@/components/simulations/interactive/InteractiveTriangleClassificationVisual";
import { InteractiveUnitConversionVisual } from "@/components/simulations/interactive/InteractiveUnitConversionVisual";
import { InteractiveWeightComparisonVisual } from "@/components/simulations/interactive/InteractiveWeightComparisonVisual";
import type { FractionShape, InteractiveVisualProps } from "@/components/simulations/interactive/types";
import { InteractiveTopicVisual } from "@/components/simulations/interactive/InteractiveTopicVisual";
import { isTopicExtendedParams } from "@/lib/simulations/extendedWidgets";
import {
  isArithmeticParams,
  isClockParams,
  isComparisonParams,
  isFractionParams,
  isNumberBondParams,
  isNumberLineParams,
  isPolygonParams,
  isPrimeFactorTreeParams,
  isRatioParams,
  isRectangleParams,
  isShapeSortParams,
  isSymmetryAxisParams,
  isSymmetryPictureParams,
  isAngleKindParams,
  isIntersectingAnglesParams,
  isTriangleAngleSumParams,
  isTriangleClassificationParams,
  isUnitParams,
} from "@/lib/simulations/simulatorTaskMode";

export function InteractiveEducationalVisual(props: InteractiveVisualProps) {
  const {
    slug,
    visualKind,
    compactChrome = false,
    params,
    targetParams,
    mode,
    showSolution,
    fractionShape,
    onFractionShapeChange,
    onChange,
    numericResult,
    onNumericResultChange,
    comparisonSign,
    onComparisonSignChange,
    selectedLabel,
    onSelectedLabelChange,
    ratioPair,
    onRatioPairChange,
  } = props;

  if (isAngleKindParams(params) || slug === "katy-rodzaje") {
    return (
      <InteractiveAngleKindsVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isIntersectingAnglesParams(params) || slug === "katy-przylegle-wierzcholkowe") {
    return (
      <InteractiveIntersectingAnglesVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isPrimeFactorTreeParams(params) || slug === "rozklad-na-czynniki") {
    return (
      <InteractivePrimeFactorTreeVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        onChange={onChange}
      />
    );
  }

  if ((slug === "liczby-wymierne-na-osi" || slug === "ulamki-na-osi") && isFractionParams(params)) {
    return (
      <InteractiveFractionNumberLineVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        onChange={onChange}
      />
    );
  }

  if (isFractionParams(params) || visualKind === "fraction" || slug === "ulamki-ciasto") {
    return (
      <InteractiveFractionVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        shape={fractionShape}
        onShapeChange={onFractionShapeChange}
        onChange={onChange}
      />
    );
  }

  if (isNumberLineParams(params) || visualKind === "number-line") {
    return (
      <InteractiveNumberLineVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isNumberBondParams(params) || slug === "rozklad-liczby-domki") {
    return (
      <InteractiveNumberBondVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (slug.startsWith("liczmany-") && isArithmeticParams(params)) {
    return (
      <InteractiveLiczmanyVisual
        slug={slug}
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isTopicExtendedParams(params) || isShapeSortParams(params)) {
    return (
      <InteractiveTopicVisual
        slug={slug}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        compactChrome={compactChrome}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isArithmeticParams(params)) {
    return (
      <InteractiveArithmeticVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (slug === "porownywanie-liczb-waga" && isComparisonParams(params)) {
    return (
      <InteractiveWeightComparisonVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        comparisonSign={comparisonSign}
        onComparisonSignChange={onComparisonSignChange}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isComparisonParams(params)) {
    return (
      <InteractiveComparisonVisual
        compactChrome={compactChrome}
        params={params}
        mode={mode}
        showSolution={showSolution}
        comparisonSign={comparisonSign}
        onComparisonSignChange={onComparisonSignChange}
        onChange={onChange}
      />
    );
  }

  if (isRatioParams(params)) {
    return (
      <InteractiveRatioVisual
        slug={slug}
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        ratioPair={ratioPair}
        onRatioPairChange={onRatioPairChange}
        onChange={onChange}
      />
    );
  }

  if (isTriangleAngleSumParams(params) || slug === "suma-katow-w-trojkacie") {
    return (
      <InteractiveTriangleAngleSumVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isTriangleClassificationParams(params) || slug === "trojkaty-klasyfikacja") {
    return (
      <InteractiveTriangleClassificationVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isPolygonParams(params) || slug === "wielokaty") {
    return (
      <InteractivePolygonVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isSymmetryPictureParams(params) || isSymmetryAxisParams(params) || slug.startsWith("symetria") || slug === "os-symetrii-figury") {
    return (
      <InteractiveSymmetryVisual
        slug={slug}
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isShapeSortParams(params) || slug === "figury-podstawowe-sortowanie") {
    return (
      <InteractiveShapeSortVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        selectedLabel={selectedLabel}
        onSelectedLabelChange={onSelectedLabelChange}
        onChange={onChange}
      />
    );
  }

  if (isRectangleParams(params)) {
    return (
      <InteractiveRectangleVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isClockParams(params) || slug.startsWith("zegar-")) {
    return (
      <InteractiveClockVisual
        slug={slug}
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  if (isUnitParams(params) || slug === "jednostki-dlugosci") {
    return (
      <InteractiveUnitConversionVisual
        compactChrome={compactChrome}
        params={params}
        targetParams={targetParams}
        mode={mode}
        showSolution={showSolution}
        numericResult={numericResult}
        onNumericResultChange={onNumericResultChange}
        onChange={onChange}
      />
    );
  }

  return (
    <InteractiveFallbackVisual
      slug={slug}
      params={params}
      targetParams={targetParams}
      mode={mode}
      showSolution={showSolution}
      compactChrome={compactChrome}
      numericResult={numericResult}
      onNumericResultChange={onNumericResultChange}
    />
  );
}

export type { FractionShape };
