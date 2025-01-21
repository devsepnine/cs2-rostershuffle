<script lang="ts">
  import type {IPlayer, IPlayerCheck} from "../types/common";
  import PlayerList from "$lib/components/player/PlayerList.svelte";
  import Result from "$lib/components/result/Result.svelte";
  import {goto} from "$app/navigation";
  import {
    calculateCustomELO,
    createCumulativeWeights,
    isValidPlayerArray,
    selectRandomWeightedBinary
  } from "$lib/utils";
  import {toast} from "svelte-sonner";
  import {onMount} from "svelte";
  import {mapStore, playerStore, useMapStore, usePlayerCTStore, usePlayerTStore} from "../store/rosterStore";
  import {invoke} from "@tauri-apps/api/core";

  import settingsIcon from '$lib/assets/settings.svg';

  let fileInputRef: HTMLInputElement;


  let tempPlayers: IPlayerCheck[] = [];

  $: processing = false;

  onMount(() => {
    const loadPlayers = structuredClone($playerStore)
    tempPlayers = loadPlayers.map((p: IPlayer) => ({
      ...p,
      check: false,
      customElo: calculateCustomELO(p)
    }))
  })

  const goEditPage = () => {
    goto("/edit");
  }

  function handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = String(e?.target?.result);
          if (!data) {
            return;
          }
          const {players}: { players: IPlayer[] } = JSON.parse(data);
          if (!isValidPlayerArray(players)) {
            toast.error("올바르지 않은 JSON 파일입니다.")
            return;
          }
          const checkPlayers: IPlayerCheck[] = players.map((p: IPlayer) => ({
            ...p,
            check: false,
            customElo: calculateCustomELO(p)
          }))
          playerStore.set(structuredClone(players));
          tempPlayers = structuredClone(checkPlayers)
          toast.success("불러오기 성공")

        } catch (err) {
          console.error('JSON Parsing Error:', err);
          toast.error("올바르지 않은 JSON 파일입니다.")
        } finally {
          fileInputRef.value = ''
        }
      };
      reader.onerror = () => {
        console.error('FileReader Error:', reader.error);
        toast.error("올바르지 않은 JSON 파일입니다.")
      };
      reader.readAsText(file);
    }
  }

  const splitTeam = async () => {
    const players = structuredClone(tempPlayers).filter((p) => p.check);
    if (players.length < 4) {
      toast.error('플레이어 인원수는 4명이상으로 설정해주세요.')
      processing = false
      return;
    }
    try {
      const result: {
        teamCt: IPlayerCheck[];
        teamT: IPlayerCheck[];
      } = await invoke('balance_teams_async', {
        players,
        maxAllowedDifference: 400
      });
      usePlayerTStore.set(result.teamT);
      usePlayerCTStore.set(result.teamCt);
      selectMap();
    } catch (e) {
      console.error(e);
      toast.error('팀 구성에 실패하였습니다.')
    } finally {
      processing = false;
    }
  }

  const selectMap = () => {
    let mapList = $mapStore
    mapList = mapList.filter((m) => m.enabled);
    const mapWeight = createCumulativeWeights(mapList);
    let selectMap = selectRandomWeightedBinary(mapList, mapWeight);
    while (!selectMap) {
      selectMap == selectRandomWeightedBinary(mapList, mapWeight);
    }
    useMapStore.set(selectMap);
    processing = false;
  }

  const handleRoster = () => {
    if (processing) return
    processing = true;
    splitTeam()
  }

</script>

<button class="settings" on:click={goEditPage}>
    <img src={settingsIcon} alt="settings">
</button>
<div class="root">
    <div class="left">
        <div class="overflow-hidden h-full max-h-full">
            <PlayerList playerList={tempPlayers} uploadFunc={()=>{
                    fileInputRef.click()
                }}/>
        </div>
    </div>
    <div class="right">
        <Result processing={processing}/>
        <div class="bottom ">
            <div class={`btn-shuffle ${processing && 'disabled'}`}>
                <button on:click={handleRoster} class="w-full h-full text-4xl font-[800]" disabled={processing}>
                    {processing ? 'Searching..' : 'Shuffle'}
                </button>
            </div>
            <input bind:this={fileInputRef} type="file" accept=".json,application/json" on:change={handleFileChange}
                   class="hidden"/>
        </div>
    </div>

</div>

<style lang="scss">
  .settings {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
  }

  .root {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    background-image: url("$lib/assets/bg.svg");
    background-size: 800% 800%;
    background-repeat: no-repeat;
    animation: slideBackground 360s linear infinite;

    .left {
      flex-shrink: 0;
      flex-grow: 1;
      min-width: 12.5rem;
      max-width: 18.75rem;
      box-shadow: 1px 0 15px 5px hsl(var(--background)/ 0.5);
      background: hsl(var(--background)/0.3);
    }

    .right {
      width: 100%;
      min-width: 37.5rem;
      flex-grow: 0;
      flex-shrink: 1;

      .bottom {
        display: flex;
        align-items: center;
        justify-content: center;
        column-gap: 1rem;
        width: 100%;
        padding: 1rem;
        height: 6.25rem;
        background: hsl(var(--background) / 0.5);

        .btn-shuffle {
          overflow: hidden;
          width: 50%;
          max-width: 40.625rem;
          height: 100%;
          border-radius: 0.5rem;
          background-image: url("$lib/assets/bg2.svg");
          background-position: center center;
          background-size: 400% 900%;
          transition: background-size 300ms ease;
          animation: slideBackground 30s linear infinite;

          &.disabled {
            background-image: url("$lib/assets/bg3.svg");
          }

          &:hover {
            background-size: 600% 1200%;
          }
        }
      }
    }
  }
</style>