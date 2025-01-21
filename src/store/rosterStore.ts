import { writable } from "svelte/store";
import {
  type ICustomElo,
  type IMap,
  type IPlayer,
  type IPlayerCheck,
} from "../types/common";
import { localStorageWritable } from "./localStorageStore";

export const STORE_ID = {
  player: "playerInfoStore",
  map: "mapInfoStore",
  customElo: "customEloInfo",
};

export const customEloStore = localStorageWritable<ICustomElo>(
  STORE_ID.customElo,
  {
    adr: 10,
    kd: 6,
    winRate: 2,
    headshotPercentage: 4,
    hltvRating: 10,
  },
);

export const playerStore = localStorageWritable<IPlayer[]>(STORE_ID.player, []);
export const mapStore = localStorageWritable<IMap[]>(STORE_ID.map, [
  {
    name: "Dust2",
    weight: 1,
    enabled: true,
  },
  {
    name: "Mirage",
    weight: 1,
    enabled: true,
  },
  {
    name: "Inferno",
    weight: 1,
    enabled: true,
  },
  {
    name: "Overpass",
    weight: 1,
    enabled: true,
  },
  {
    name: "Nuke",
    weight: 1,
    enabled: true,
  },
  {
    name: "Vertigo",
    weight: 1,
    enabled: true,
  },
  {
    name: "Ancient",
    weight: 1,
    enabled: true,
  },
  {
    name: "Anubis",
    weight: 1,
    enabled: true,
  },
  {
    name: "Train",
    weight: 1,
    enabled: true,
  },
  {
    name: "Basalt",
    weight: 1,
    enabled: true,
  },
  {
    name: "Edin",
    weight: 1,
    enabled: true,
  },
  {
    name: "Italy",
    weight: 1,
    enabled: true,
  },
  {
    name: "Office",
    weight: 1,
    enabled: true,
  },
]);
export const usePlayerTStore = writable<IPlayerCheck[]>([]);
export const usePlayerCTStore = writable<IPlayerCheck[]>([]);
export const useMapStore = writable<IMap>({
  name: "Not Select",
  weight: 0,
  enabled: true,
});
export const useCustomElo = localStorageWritable;
