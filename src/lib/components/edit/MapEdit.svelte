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

  export let originMap: IMap;

  const dispatch = createEventDispatcher()


  let weight: string | number = originMap.weight;

  const saveData = () => {
    dispatch('updateMap', {
      name: originMap.name,
      weight: Number(weight)
    })
  }

</script>

<Sheet>
    <SheetTrigger>
        <div class="map">
            {originMap.name}
            <Badge>
                Weight : {originMap.weight}
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
                <Label for="kd" class="text-right">Weight</Label>
                <Input id="kd" bind:value={weight} inputmode="numeric" pattern="[0-9.]*"
                       on:input={(e) => {weight = changeNumberValue(e);}}
                       on:blur={(e) => {weight = String(changeNumberBlur(e));}}
                       class="col-span-3"/>
            </div>
            <SheetClose asChild let:builder>
                <Button builders={[builder]} on:click={saveData}>
                    Save Changes
                </Button>
            </SheetClose>
        </div>
    </SheetContent>
</Sheet>

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

