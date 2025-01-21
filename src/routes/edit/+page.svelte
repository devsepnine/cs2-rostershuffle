<script lang="ts">
  import {localStorageWritable} from "../../store/localStorageStore";
  import type {IMap, IPlayer} from "../../types/common";

  import close from '$lib/assets/cancel.svg';
  import {goto} from "$app/navigation";
  import {ScrollArea} from "$lib/components/ui/scroll-area";
  import PlayerEdit from "$lib/components/edit/PlayerEdit.svelte";
  import PlayerADD from "$lib/components/edit/PlayerADD.svelte";
  import MapEdit from "$lib/components/edit/MapEdit.svelte";
  import CustomElo from "$lib/components/edit/CustomElo.svelte";
  import {STORE_ID} from "../../store/rosterStore";

  $: playerStore = localStorageWritable<IPlayer[]>(STORE_ID.player, []);
  $: mapStore = localStorageWritable<IMap[]>(STORE_ID.map, []);

  const goHome = () => {
    goto('/');
  }

  const handlePlayerUpdate = (e: CustomEvent) => {
    playerStore.update(players => {
      return players.map(p => {
        if (p.name === e.detail.originName) {
          return e.detail.player;
        }
        return p;
      })
    })
  }

  const handlePlayerAdd = (e: CustomEvent) => {
    playerStore.update(players => {
      return [...players, e.detail.player]
    })
  }

  const handlePlayerDelete = (e: CustomEvent) => {
    playerStore.update(players => {
      return players.filter((p) => p.name !== e.detail.originName)
    })
  }

  const handleMapUpdate = (e: CustomEvent) => {
    mapStore.update(map => {
      return map.map(m => {
        if (m.name == e.detail.name) {
          return e.detail
        }
        return m
      })
    })
  }

</script>

<button class="close" on:click={goHome}>
    <img src={close} alt="close"/>
</button>
<div class="root">
    <div class="box">
        <div class="tab">
            <div class="wrapper">
                <ScrollArea class="h-full">
                    <div class="flex flex-col">
                        {#each $playerStore as player (player.name)}
                            <PlayerEdit originPlayer={player} on:updatePlayer={handlePlayerUpdate}
                                        on:deletePlayer={handlePlayerDelete}/>
                        {/each}
                        <PlayerADD on:addPlayer={handlePlayerAdd}/>
                    </div>
                </ScrollArea>
            </div>
        </div>
        <div class="tab">
            <div class="wrapper">
                <ScrollArea class="h-full">
                    {#each $mapStore as map (map.name)}
                        <div>
                            <MapEdit originMap={map} on:updateMap={handleMapUpdate}/>
                        </div>
                    {/each}
                    <div>
                        <CustomElo/>
                    </div>
                </ScrollArea>
            </div>
        </div>
    </div>
</div>


<style lang="scss">
  .close {
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
    padding: 3.5rem 1rem 1rem;
    background-image: url("$lib/assets/bg.svg");
    background-size: 800% 800%;
    background-repeat: no-repeat;
    animation: slideBackground 360s linear infinite;

    .box {
      position: relative;
      display: flex;
      column-gap: 8px;
      width: 100%;
      height: 100%;
      border-radius: var(--radius);

      .tab {
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: 0.5rem;
        border-radius: var(--radius);
        background: hsl(var(--card) / 0.5);

        .wrapper {
          overflow: auto;
          position: relative;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
</style>