<script lang="ts">
  import {HoverCard, HoverCardContent, HoverCardTrigger} from "$lib/components/ui/hover-card/index.js";
  import type {IPlayerCheck} from "../../../types/common";
  import {Checkbox} from "$lib/components/ui/checkbox";

  export let player: IPlayerCheck;
  export let check: boolean;
  const toggleCheck = () => {
    check = !check;
  }
</script>

<button class="player" on:click={toggleCheck}>
    <Checkbox
            id={player.name}
            checked={check}
    />
    <span class="name truncate">{player.name}</span>
    <HoverCard>
        <HoverCardTrigger>
            <div class="custom-elo">{player.customElo}</div>
        </HoverCardTrigger>
        <HoverCardContent class="bg-card rounded-2xl">
            <div>Name: {player.name}</div>
            <div>K/D : {player.kd}</div>
            <div>Head : { player.headshotPercentage}%</div>
            <div>PremierScore : {player.premierScore}</div>
            <div>ADR : {player.adr}</div>
            <div>WinRate : {player.winRate}%</div>
        </HoverCardContent>
    </HoverCard>
</button>

<style lang="scss">
  .player {
    position: relative;
    display: flex;
    align-items: center;
    column-gap: 8px;
    width: 100%;
    padding: 0 1rem;

    .name {
      flex-basis: 9.375rem;
      text-align: left;
      min-width: 6.25rem;
      padding-right: 0.5rem;
    }

    .custom-elo {
      display: block;
      padding: 0 0.25rem;
      background: hsl(var(--primary) / 0.8);
      box-shadow: -2px 0 0px 0px hsl(var(--primary) / 1), 2px 0 0px 0px hsl(var(--primary) / 0.7), 5px 0 0px 0px hsl(var(--primary) / 0.5), 8px 0 0px 0px hsl(var(--primary) / 0.3);
      font-size: 0.875rem;
      font-weight: 800;
    }
  }

</style>