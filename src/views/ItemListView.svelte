<script>
  import {
    parameters,
    local,
    shoppingList,
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

  export let params = {};
  var itemList = [];
  var title;
  var newItemLink;

  // Save current location
  $parameters.startLocation = $location;
  parameters.saveParams();

  $: {
    if (params.id == "null") {
      itemList = $shoppingList.filter(
        item => item.categoryId == undefined || item.categoryId == ""
      );
      title = $local.emtpyCategory;
      newItemLink = "#/item/new/" + (params.id == undefined ? "" : params.id);
    } else {
      itemList = $shoppingList.filter(item =>
        params.id == undefined ? true : item.categoryId == params.id
      );

      if (params.id == undefined) {
        title = $local.appname;
      } else {
        try {
          title = $categoryList.filter(item => item._id == params.id)[0]
            .category;
        } catch (error) {
          // database not opened ! Will be recomputed asap
          title = "";
        }
      }
    }
    newItemLink = "#/item/new/" + (params.id == undefined ? "" : params.id);
  }

  function createNew() {
    push(newItemLink);
  }

  function openDrawer() {
    dispatch("routeEvent", { action: "openDrawer" });
  }
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:hidden">
      <Button icon="menu" flat color="white" text on:click={openDrawer} />
    </div>
    <h6 class="md:pl-3 text-white text-lg">{title}</h6>
  </AppBar>

  <ul>
    {#each itemList as item (item._id)}
      <Item type="item" bind:item />
    {/each}
  </ul>

  <div class="fixed px-5 py-5 bottom-0 right-0">
    <Button color="error" icon="add" on:click={createNew} />
  </div>
</div>
