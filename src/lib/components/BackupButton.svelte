<script lang="ts">
  import {Button} from "$lib/components/ui/button";
  import {mapStore, playerStore} from "../../store/rosterStore";
  import {get} from "svelte/store";


  const handleBackup = () => {
    let jsonData = {
      players: get(playerStore),
      mapWeights: get(mapStore)
    }

    const jsonString = JSON.stringify(jsonData, null, 2);

    const blob = new Blob([jsonString], {type: "application/json"});

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json"; // 파일명 설정
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<Button variant="outline" on:click={handleBackup}>
    <span>Backup</span>
</Button>