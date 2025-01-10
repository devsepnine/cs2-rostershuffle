import {writable} from "svelte/store";
import type {IMap, IPlayerCheck} from "../types/common";


export const usePlayerTStore = writable<IPlayerCheck[]>([])

export const usePlayerCTStore = writable<IPlayerCheck[]>([])

export const useMapStore = writable<IMap>({
  name: 'Not Select',
  weight: 0,
});