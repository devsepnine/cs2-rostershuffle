<script lang="ts">
  import type {IMap} from "../../../types/common";
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
  import {Label} from "$lib/components/ui/label";
  import {Input} from "$lib/components/ui/input";
  import {changeNumberBlur, changeNumberValue} from "$lib/utils";
  import {Button} from "$lib/components/ui/button";
  import {createEventDispatcher} from "svelte";
  import {Checkbox} from "$lib/components/ui/checkbox";
  import {Slider} from "$lib/components/ui/slider";

  export let originMap: IMap;

  const dispatch = createEventDispatcher()


  let weight: number[] = [originMap.weight];
  let enabled: boolean = originMap.enabled;

  const saveData = () => {
    dispatch('updateMap', {
      name: originMap.name,
      weight: Number(weight[0]),
      enabled
    })
  }

  const toggleActive = () => {
    enabled = !enabled;
    saveData();
  }

</script>

<Sheet>
    <SheetTrigger>
        <div class="map">
            <div class="w-28 text-left">
                {originMap.name}
            </div>
            <Badge class="w-28 text-right">
                <div>
                    Weight : {originMap.weight}
                </div>
            </Badge>
        </div>
    </SheetTrigger>
    <SheetContent>
        <SheetHeader>
            <SheetTitle>
                {originMap.name}
            </SheetTitle>
            <SheetDescription>
                Edit Map Info
            </SheetDescription>
        </SheetHeader>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="kd" class="text-right">Weight </Label>
                {weight}
                <Slider min={0} max={10} step={0.1} bind:value={weight}/>
            </div>
            <SheetClose asChild let:builder>
                <Button builders={[builder]} on:click={saveData}>
                    Save Changes
                </Button>
            </SheetClose>
        </div>
    </SheetContent>
</Sheet>
<button on:click={toggleActive}>
    <Badge variant={enabled ? 'default' : 'destructive'}>
        {originMap.enabled ? 'Active' : 'Inactive'}
    </Badge>
</button>

<style lang="scss">
  .map {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem;
    border-radius: var(--radius);

    &:hover {
      background: hsl(var(--background) / 0.5)
    }
  }
</style>

