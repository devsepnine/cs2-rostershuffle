import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {cubicOut} from "svelte/easing";
import type {TransitionConfig} from "svelte/transition";
import type {IMap, IPlayer, IPlayerCheck} from "../types/common";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = {y: -8, x: 0, start: 0.95, duration: 150}
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + `${key}:${style[key]};`;
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
        opacity: t
      });
    },
    easing: cubicOut
  };
};

const calculateCustomELO = (player: IPlayer | IPlayerCheck) => {
  const customElo = Math.floor(
    (player.kd * 4) +
    (player.hltvRating * 8) +
    (player.winRate * 8) +
    (player.headshotPercentage * 2) +
    (player.adr * 10)
  )
  const premier = calculatePremierScore(customElo, player.premierScore);
  return premier;
}

const calculatePremierScore = (customElo: number, premierScore: number = 8000) => {
  const flagScore = 6000;
  const maxScore = 40000;

  let score = premierScore
  let weight: number
  if (score <= 0) {
    score = 5000;
  } else if (score <= 3000) {
    score = 3000;
  } else if (score > maxScore) {
    score = maxScore;
  }

  if (score <= flagScore) {
    weight = 0.5 + (score / flagScore) * 0.5;
  } else if (score <= 40000) {
    weight = 1 + ((score - flagScore) / 32000) * 0.5;
  } else {
    weight = 1.5;
  }

  return Math.floor(customElo * weight);
}

const createCumulativeWeights = (items: IMap[]): number[] => {
  const cumulative: number[] = [];
  let sum = 0;
  for (const item of items) {
    sum += item.weight;
    cumulative.push(sum);
  }
  return cumulative;
}


const selectRandomWeightedBinary = <T extends { weight: number }>(
  items: T[],
  cumulative: number[]
): T | null => {
  if (items.length === 0) return null;

  const totalWeight = cumulative[cumulative.length - 1];
  let randomValue = Math.random() * totalWeight;

  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (randomValue < cumulative[mid]) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return items[low];
}

const isValidPlayerArray = (data: any): data is IPlayerCheck[] => {
  if (!Array.isArray(data)) return false;
  return data.every(item =>
    typeof item.name === 'string' &&
    typeof item.premierScore === 'number' &&
    typeof item.kd === 'number' &&
    typeof item.hltvRating === 'number' &&
    typeof item.winRate === 'number' &&
    typeof item.headshotPercentage === 'number' &&
    typeof item.adr === 'number'
  );
}

const isValidMapArray = (data: any): data is IMap[] => {
  if (!Array.isArray(data)) return false;
  return data.every(item =>
    typeof item.name === 'string' &&
    typeof item.weight === 'number'
  )
}

const changeNumberValue = (e: InputEvent) => {
  let val = (e.target as HTMLInputElement)?.value ?? 0;
  val = val.replace(/[^0-9.]/g, '');
  const dotCount = (val.match(/\./g) || []).length;
  if (dotCount > 1) {
    const firstDotIndex = val.indexOf('.');
    val =
      val.substring(0, firstDotIndex + 1) +
      val.substring(firstDotIndex + 1).replace(/\./g, '');
  }
  return val;
}
const changeNumberBlur = (e: FocusEvent) => {
  let val = (e.target as HTMLInputElement)?.value ?? 0;
  if (!val || val === '.' || Number.isNaN(Number(val))) {
    val = '0';
  }
  return Number(val);
}

export {
  cn,
  flyAndScale,
  calculateCustomELO,
  createCumulativeWeights,
  selectRandomWeightedBinary,
  isValidPlayerArray,
  isValidMapArray,
  changeNumberValue,
  changeNumberBlur
}