<script>
  export let items = [];

  import Item from "./Item.svelte";
  import { fade } from "svelte/transition";

</script>

<ul>
  {#each items as item (item._id)}
    <Item bind:item />
  {/each}
</ul>
