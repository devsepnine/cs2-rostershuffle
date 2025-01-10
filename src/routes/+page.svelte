<script lang="ts">
  import type {IMap, IPlayer, IPlayerCheck} from "../types/common";
  import PlayerList from "$lib/components/player/PlayerList.svelte";
  import Result from "$lib/components/result/Result.svelte";
  import {
    calculateCustomELO,
    createCumulativeWeights,
    isValidMapArray,
    isValidPlayerArray,
    selectRandomWeightedBinary
  } from "$lib/utils";
  import {toast} from "svelte-sonner";
  import {localStorageWritable} from "../store/localStorageStore";
  import {onMount} from "svelte";
  import {get} from "svelte/store";
  import {useMapStore, usePlayerCTStore, usePlayerTStore} from "../store/rosterStore";
  import {invoke} from "@tauri-apps/api/core";

  let maxAllowedDifference: number = 400
  let fileInputRef: HTMLInputElement;

  let playerStore = localStorageWritable<IPlayer[]>('playerStore', []);
  let mapStore = localStorageWritable<IMap[]>('mapStore', []);

  let tempPlayers: IPlayerCheck[] = [];
  let mapList: IMap[] = [];

  $: processing = false;

  onMount(() => {
    const loadPlayers = structuredClone(get(playerStore))
    tempPlayers = loadPlayers.map((p: IPlayer) => ({
      ...p,
      check: false,
      customElo: calculateCustomELO(p)
    }))
    mapList = structuredClone(get(mapStore));
  })


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
          const {players, mapWeights: maps}: { players: IPlayer[], mapWeights: IMap[] } = JSON.parse(data);
          if (!isValidPlayerArray(players) || !isValidMapArray(maps)) {
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
          mapStore.set(structuredClone(maps));
          mapList = structuredClone(maps);

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


  function getCombinations<T>(arr: T[], k: number): T[][] {
    if (k === 0) return [[]];
    if (arr.length === 0) return [];

    const [first, ...rest] = arr;
    const withFirst = getCombinations(rest, k - 1).map(comb => [first, ...comb]);
    const withoutFirst = getCombinations(rest, k);

    return withFirst.concat(withoutFirst);
  }

  function splitPlayersIntoBalancedTeams(
    players: IPlayerCheck[],
  ): { teamA: IPlayerCheck[], teamB: IPlayerCheck[] } | null {
    if (players.length < 3 || players.length % 2 !== 0) {
      toast.error('플레이어수는 2명 초과 짝수여야 합니다.')
      return null;
    }
    if (players.length > 26) {
      toast.error('플레이어수는 26명을 초과할수 없습니다.')
      return null;
    }

    const sortedPlayers = [...players].sort((a, b) => b.customElo - a.customElo);
    const topTwo = sortedPlayers.slice(0, 2);
    const bottomTwo = sortedPlayers.slice(-2);

    const topAssignments = [
      {teamA: [topTwo[0]], teamB: [topTwo[1]]},
      {teamA: [topTwo[1]], teamB: [topTwo[0]]},
    ];

    const bottomAssignments = [
      {teamA: [bottomTwo[0]], teamB: [bottomTwo[1]]},
      {teamA: [bottomTwo[1]], teamB: [bottomTwo[0]]},
    ];

    const remainingPlayers = sortedPlayers.slice(2, -2);

    let bestSplit: { teamA: IPlayerCheck[], teamB: IPlayerCheck[] } | null = null;
    let minDifference = Infinity;
    const acceptableSplits: { teamA: IPlayerCheck[], teamB: IPlayerCheck[], difference: number }[] = [];

    for (const topAssign of topAssignments) {
      for (const bottomAssign of bottomAssignments) {
        const initialTeamA = [...topAssign.teamA, ...bottomAssign.teamA];
        const initialTeamB = [...topAssign.teamB, ...bottomAssign.teamB];

        const teamSize = players.length / 2;
        const remainingTeamASize = teamSize - initialTeamA.length;

        // 남은 플레이어의 모든 조합을 생성
        const combinations = getCombinations(remainingPlayers, remainingTeamASize);

        for (const combo of combinations) {
          const currentTeamA = [...initialTeamA, ...combo];
          const currentTeamB = initialTeamB.concat(
            remainingPlayers.filter(player => !combo.includes(player))
          );

          const teamASum = currentTeamA.reduce((sum, player) => sum + player.customElo, 0);
          const teamBSum = currentTeamB.reduce((sum, player) => sum + player.customElo, 0);
          const difference = Math.abs(teamASum - teamBSum);

          // 최소 차이 업데이트
          if (difference < minDifference) {
            minDifference = difference;
            bestSplit = {teamA: currentTeamA, teamB: currentTeamB};
          }

          // 허용 가능한 분할 수집
          if (difference <= maxAllowedDifference) {
            acceptableSplits.push({teamA: currentTeamA, teamB: currentTeamB, difference});
          }
        }
      }
    }

    // 허용 가능한 분할 중 무작위 선택
    if (acceptableSplits.length > 0) {
      const randomIndex = Math.floor(Math.random() * acceptableSplits.length);
      const selected = acceptableSplits[randomIndex];
      return {teamA: selected.teamA, teamB: selected.teamB};
    }

    // 허용 가능한 분할이 없으면 최적의 분할 반환
    return bestSplit;

  }

  const splitTeam = async () => {
    const players = structuredClone(tempPlayers).filter((p) => p.check);
    if (players.length < 4 || players.length > 24) {
      toast.error('플레이어 인원수는 4명이상 24명 미만으로 설정해주세요.')
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
  @keyframes slideBackground {
    0% {
      background-position: 40% center;
    }
    50% {
      background-position: 60% center;
    }
    100% {
      background-position: 40% center;
    }
  }

  .root {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    background-image: url("$lib/assets/bg.svg");
    background-size: 800% 800%;
    background-repeat: no-repeat;
    animation: slideBackground 360s linear alternate;

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
            background-size: 400% 1200%;
          }
        }
      }
    }
  }
</style>