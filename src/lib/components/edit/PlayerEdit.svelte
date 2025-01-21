<script lang="ts">
  import type {IPlayer} from "../../../types/common";
  import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
  } from "$lib/components/ui/sheet/index.js";
  import {Badge} from "$lib/components/ui/badge";
  import {Label} from "$lib/components/ui/label/index.js";
  import {Input} from "$lib/components/ui/input";
  import {Button} from "$lib/components/ui/button";
  import {createEventDispatcher} from "svelte";
  import {changeNumberBlur, changeNumberValue} from "$lib/utils";

  export let originPlayer: IPlayer;

  const dispatch = createEventDispatcher()

  let name: string = originPlayer.name;
  let kd: string | number = originPlayer.kd.toString();
  let hltvRating: string | number = originPlayer.hltvRating.toString();
  let winRate: string | number = originPlayer.winRate.toString();
  let headshotPercentage: string | number = originPlayer.headshotPercentage.toString();
  let adr: string | number = originPlayer.adr.toString();
  let premierScore: string | number = originPlayer.premierScore.toString();

  const saveData = () => {
    const player = {
      name: name,
      premierScore: Number(premierScore),
      adr: Number(adr),
      hltvRating: Number(hltvRating),
      headshotPercentage: Number(headshotPercentage),
      winRate: Number(winRate),
      kd: Number(kd)
    }
    dispatch('updatePlayer', {
      player,
      originName: originPlayer.name
    })
  }

  const deletePlayer = () => {
    dispatch('deletePlayer', {
      originName: originPlayer.name
    })
  }
</script>

<Sheet>
    <SheetTrigger>
        <div class="player">
            <div class="name truncate">
                {originPlayer.name}
            </div>
            <Badge>
                KD : {originPlayer.kd}
            </Badge>
            <Badge>
                WinRate : {originPlayer.winRate}
            </Badge>
            <Badge>
                Premier : {originPlayer.premierScore}
            </Badge>
        </div>
    </SheetTrigger>
    <SheetContent class="h-screen">
        <div class="sheet">
            <SheetHeader>
                <SheetTitle>
                    <div class="name">
                        {originPlayer.name}
                    </div>
                </SheetTitle>
                <SheetDescription>
                    Edit Player Info
                </SheetDescription>
            </SheetHeader>
            <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="name" class="text-right">Name</Label>
                    <Input id="name" bind:value={name}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="kd" class="text-right">K/D</Label>
                    <Input id="kd" bind:value={kd} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e) => {kd = changeNumberValue(e);}}
                           on:blur={(e) => {kd = String(changeNumberBlur(e));}}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="hltv" class="text-right">HLTV Rating</Label>
                    <Input id="hltv" bind:value={hltvRating} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e)=>{hltvRating = changeNumberValue(e)}}
                           on:blur={(e)=> {hltvRating=String(changeNumberBlur(e))}}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="win" class="text-right">Win Rating</Label>
                    <Input id="win" bind:value={winRate} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e)=>{winRate = changeNumberValue(e)}}
                           on:blur={(e)=> {winRate=String(changeNumberBlur(e))}}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="head" class="text-right">HeadShot Percent</Label>
                    <Input id="head" bind:value={headshotPercentage} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e)=>{headshotPercentage = changeNumberValue(e)}}
                           on:blur={(e)=> {headshotPercentage=String(changeNumberBlur(e))}}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="adr" class="text-right">ADR</Label>
                    <Input id="adr" bind:value={adr} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e)=>{adr = changeNumberValue(e)}}
                           on:blur={(e)=> {adr =String(changeNumberBlur(e))}}
                           class="col-span-3"/>
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                    <Label for="premier" class="text-right">Premier Score</Label>
                    <Input id="premier" bind:value={premierScore} inputmode="numeric" pattern="[0-9.]*"
                           on:input={(e)=>{premierScore = changeNumberValue(e)}}
                           on:blur={(e)=> {premierScore=String(changeNumberBlur(e))}}
                           class="col-span-3"/>
                </div>
                <SheetClose asChild let:builder>
                    <Button builders={[builder]} on:click={saveData}>
                        Save Changes
                    </Button>
                </SheetClose>
                <SheetClose asChild let:builder>
                    <Button variant="destructive" builders={[builder]} on:click={deletePlayer}>
                        Delete Player
                    </Button>
                </SheetClose>
            </div>
        </div>
    </SheetContent>
</Sheet>

<style lang="scss">
  .player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--radius);

    &:hover {
      background: hsl(var(--background) / 0.5)
    }

    .name {
      width: 7.8125rem;
      text-align: left;
    }
  }

  .sheet {
    .name {
      font-size: 1.5rem;
      font-weight: 700;
    }
  }
</style>