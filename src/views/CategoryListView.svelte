<script>
  import {
    parameters,
    local,
    categoryList
  } from "../components/state.js";

  import Item from "../components/Item.svelte";

  import { onMount, onDestroy } from "svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { fade } from "svelte/transition";
  import { Button } from "smelte";
  import { AppBar } from "smelte";

  import { push, location } from "svelte-spa-router";

  // Save current location
  $parameters.startLocation = $location;
  parameters.saveParams();

  function openDrawer() {
    dispatch("routeEvent", { action: "openDrawer" });
  }
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:hidden">
      <Button icon="menu" flat color="white" text on:click={openDrawer} />
    </div>
    <h6 class="md:pl-3 text-white text-lg">{$local.categories}</h6>
  </AppBar>

  <ul>
    {#each $categoryList as item (item._id)}
      <Item type="category" bind:item />
    {/each}
  </ul>

  <div class="fixed px-5 py-5 bottom-0 right-0">
    <Button color="error" icon="add" on:click={() => push('#/category/new')} />
  </div>
</div>
