<script lang="ts">
  import '../app.scss';
  import '../font.scss';
  import {Toaster} from "$lib/components/ui/sonner";

  let {children} = $props();
</script>

<Toaster position="top-right" richColors theme="dark" closeButton/>

{@render children()}
