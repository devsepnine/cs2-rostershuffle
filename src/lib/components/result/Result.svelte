<script lang="ts">

  import {useMapStore, usePlayerCTStore, usePlayerTStore} from "../../../store/rosterStore";
  import type {IPlayerCheck} from "../../../types/common";
  import ctIcon from "$lib/assets/ct_icon.webp"
  import tIcon from "$lib/assets/t_icon.webp"
  import {ScrollArea} from "$lib/components/ui/scroll-area";
  import {AnimatedCounter} from "@benzara/svelte-animated-counter";

  export let processing: boolean;

  $: t = $usePlayerTStore
  $: ct = $usePlayerCTStore;
  $: map = $useMapStore;

  $:  bgUrl = `/assets/map/${map.name}.webp`;

  const getSumElo = (players: IPlayerCheck[]) => {
    return players.reduce((sum, player) => sum + player.customElo, 0);
  }

  $: customMapStyles = map.name ? `
  background-image: url(${bgUrl})
  ` : ``;

  $: eloCompare = Math.abs(getSumElo(t) - getSumElo(ct));
  $: values = Array.from({length: 60}, (_, i) => ((eloCompare) + i).toString());
</script>

<div class="root">
    <div class="map" style={customMapStyles}>
        <div class="map-name">
            {map.name}
        </div>
    </div>
    <div class="player-wrapper">
        {#if ct.length && t.length}
            <div class="compare">
                {#if !processing}
                    <AnimatedCounter
                            values={values}
                            class='w-full text-center'
                            interval={20}
                            startImmediately={true}
                            loop={false}
                            direction="down"
                            ease="cubic-bezier(0.25, 0.1, 0.25, 1)"
                    />
                {:else}
                    <span>0</span>
                {/if}
            </div>
            <ScrollArea class="w-full h-full">
                <div class="player-result">
                    <div class="box">
                        <div class="title">
                            <img src={ctIcon} alt="ct" width="80px">
                        </div>
                        <div class="elo">
                            <div>
                                {getSumElo(ct)}
                            </div>
                        </div>
                        <div class="list">
                            {#each ct.toSorted((a, b) => {
                                if (a.customElo === b.customElo) return 0;
                                return a.customElo > b.customElo ? -1 : 1;
                            }) as player (player.name)}
                                <div class="player">
                                    {player.name}
                                </div>
                            {/each}
                        </div>
                    </div>
                    <div class="box">
                        <div class="title">
                            <img src={tIcon} alt="t" width="80px"/>
                        </div>
                        <div class="elo">
                            <div>
                                {getSumElo(t)}
                            </div>
                        </div>
                        <div class="list">
                            {#each t.toSorted((a, b) => {
                                if (a.customElo === b.customElo) return 0;
                                return a.customElo > b.customElo ? -1 : 1;
                            }) as player (player.name)}
                                <div class="player">
                                    {player.name}
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        {/if}
    </div>
</div>


<style lang="scss">
  .root {
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: calc(100% - 6.25rem);
  }

  .map {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 150px;
    padding: 1rem;
    font-size: 3rem;
    font-weight: 900;
    text-align: center;
    box-shadow: 0 1px 15px 5px hsl(var(--background)/0.5);
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    text-shadow: 2px 2px 10px rgba(var(--background) /  0.8);

    &::after {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: hsl(var(--background) / 0.3);
    }

    .map-name {
      z-index: 1;
    }
  }

  .player-wrapper {
    position: relative;
    width: 100%;
    height: calc(100% - 9.375rem);
  }

  .player-result {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: calc(100% - 9.375rem);
    padding: 2rem 1rem;
    text-align: center;

    .box {
      position: relative;
      width: 100%;

      .title {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .elo {
        display: flex;
        justify-content: center;
        align-items: center;
        column-gap: 0.25rem;
        width: 100%;
        font-size: 2.5rem;
        font-weight: 700;
      }

      .list {
        display: flex;
        flex-direction: column;
        row-gap: 0.25rem;

        .player {
          width: 100%;
          font-size: 1.2rem;
          font-weight: 500;
        }
      }

    }
  }

  .compare {
    position: absolute;
    top: 3.9rem;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 2rem;
    width: 9.375rem;
    height: 2.5rem;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -1px;
    color: hsl(var(--card-foreground) / 1);
    text-shadow: 1px 1px 1px rgba(var(--background) /  0.8);
    background: hsl(var(--violet) / 0.8);
    box-shadow: -4px 0 0px 0px hsl(var(--violet) / 1), 4px 0 0px 0px hsl(var(--violet) / 0.7), 8px 0 0px 0px hsl(var(--violet) / 0.5), 12px 0 0px 0px hsl(var(--violet) / 0.3);
    transform: translate(-50%, -50%);
  }
</style>