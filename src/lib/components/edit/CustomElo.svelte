<script lang="ts">

  import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
  } from "$lib/components/ui/sheet/index.js";
  import {Button} from "$lib/components/ui/button";
  import {get} from "svelte/store";

  import {customEloStore} from "../../../store/rosterStore";
  import {Slider} from "$lib/components/ui/slider";
  import {Label} from "$lib/components/ui/label";

  let tempElo = get(customEloStore);

  let kd = [tempElo.kd];
  let adr = [tempElo.adr];
  let winRate = [tempElo.winRate];
  let headshotPercentage = [tempElo.headshotPercentage];
  let hltvRating = [tempElo.hltvRating];

  const saveChanges = () => {
    customEloStore.set({
      kd: kd[0],
      adr: adr[0],
      winRate: winRate[0],
      headshotPercentage: headshotPercentage[0],
      hltvRating: hltvRating[0]
    });
  }
</script>

<Sheet>
    <SheetTrigger class="p-4 w-full">
        <Button class="w-full">Edit CustomElo Rate</Button>
    </SheetTrigger>
    <SheetContent>
        <SheetHeader>
            <SheetTitle>Edit CustomElo Rate</SheetTitle>
        </SheetHeader>
        <div class="grid gap-4 py-4">
            <div class="flex flex-col gap-y-2">
                <Label>kd : {kd}</Label>
                <Slider min={0} max={10} step={0.1} bind:value={kd}/>
            </div>
            <div class="flex flex-col gap-y-2">
                <Label>adr : {adr}</Label>
                <Slider min={0} max={10} step={0.1} bind:value={adr}/>
            </div>
            <div class="flex flex-col gap-y-2">
                <Label>winRate : {winRate}</Label>
                <Slider min={0} max={10} step={0.1} bind:value={winRate}/>
            </div>
            <div class="flex flex-col gap-y-2">
                <Label>headshotPercentage : {headshotPercentage}</Label>
                <Slider min={0} max={10} step={0.1} bind:value={headshotPercentage}/>
            </div>
            <div class="flex flex-col gap-y-2">
                <Label>hltvRating : {hltvRating}</Label>
                <Slider min={0} max={10} step={0.1} bind:value={hltvRating}/>
            </div>
        </div>

        <SheetClose class="p-2 w-full">
            <Button class="w-full" on:click={saveChanges}>
                Save Changes
            </Button>
        </SheetClose>
    </SheetContent>
</Sheet>
