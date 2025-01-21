<script lang="ts">
  import Player from "$lib/components/player/Player.svelte";
  import {ScrollArea} from "$lib/components/ui/scroll-area";
  import BackupButton from "$lib/components/BackupButton.svelte";
  import {Button} from "$lib/components/ui/button";
  import {Input} from "$lib/components/ui/input";

  export let playerList;
  export let uploadFunc;

  let filteredName = "";

  $: sortedPlayers = [...playerList].sort((a, b) => {
    if (a.check && !b.check) return -1;
    if (!a.check && b.check) return 1;
    return 0;
  });

  const selectPlayer = () => {
    if (!Array.isArray(playerList)) {
      console.error("playerList 는 배열이어야 합니다.");
      return 0;
    }

    return playerList.reduce((acc, player) => {
      if (player.check) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }
</script>

<div class="overflow-hidden relative flex flex-col items-center h-full max-h-full">
    <div class="title">
        Player ( {selectPlayer()} )
    </div>
    <div class="list-container">
        <ScrollArea class="h-full">
            <div class="player">
                <div class="util">
                    <Button class="upload" variant="outline" on:click={uploadFunc}>
                        <span>Import</span>
                    </Button>
                    <BackupButton/>
                </div>
                <div class="py-2 px-4">
                    <Input bind:value={filteredName}/>
                </div>
                {#each sortedPlayers.filter((p) => p.name.includes(filteredName)) as player (player.name)}
                    <Player bind:check={player.check} player={player}/>
                {/each}
            </div>

        </ScrollArea>
    </div>
</div>

<style>
    .title {
        width: 100%;
        padding: 1rem 0;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        border-bottom: 1px solid hsl(var(--border));
    }

    .list-container {
        width: 100%;
        height: calc(100% - 4.3125rem);

        .player {
            display: flex;
            flex-direction: column;
            row-gap: 0.5rem;
            padding: 1rem 0;
        }

        .util {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            height: 3.125rem;
            padding: 0 1rem;
        }
    }
</style>