<script>
  import { local } from "../components/Local.js";
  import { shoppingList, categoryList, addItem, removeItem, updateItem } from "../components/Database.js";

  import Item from "../components/Item.svelte";

  import { onMount, onDestroy } from "svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { fade } from "svelte/transition";
  import { Button } from "smelte";
  import { AppBar } from "smelte";

  import { push } from 'svelte-spa-router';

  export let params = {};
  var itemList = [];
  var title;
  var newItemLink;
  $: {

    if (params.id == 'null') {
      itemList = $shoppingList.filter( item => ( (item.categoryId == undefined) || (item.categoryId == '')) );
      title = $local.emtpyCategory;
      newItemLink = '#/item/new/' + ((params.id == undefined) ? '' : params.id);
    } else {
      itemList = $shoppingList.filter( item => (params.id == undefined) ? true : item.categoryId == params.id );
      title = (params.id == undefined) ? $local.appname : $categoryList.filter( item => item._id == params.id )[0].category;
      newItemLink = '#/item/new/' + ((params.id == undefined) ? '' : params.id);
    }
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
      <Button icon="menu" small flat color="white" text on:click={openDrawer} />
    </div>
    <h6 class="pl-3 text-white tracking-widest font-thin text-lg">
      {title}
    </h6>
  </AppBar>


  <ul>
    {#each itemList as item (item._id)}
      <Item bind:item />
    {/each}
  </ul>

  <div class="fixed px-5 py-5 bottom-0 right-0">
    <Button color="error" icon="add" on:click={createNew} />
  </div>
</div>
