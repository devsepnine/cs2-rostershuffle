import {writable} from "svelte/store";
import type {IMap, IPlayer, IPlayerCheck} from "../types/common";
import {localStorageWritable} from "./localStorageStore";


export const playerStore = localStorageWritable<IPlayer[]>('playerStore', []);
export const mapStore = localStorageWritable<IMap[]>('mapStore', []);
export const usePlayerTStore = writable<IPlayerCheck[]>([])
export const usePlayerCTStore = writable<IPlayerCheck[]>([])
export const useMapStore = writable<IMap>({
  name: 'Not Select',
  weight: 0,
});