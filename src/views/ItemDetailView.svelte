<script>
  import { local } from "../components/Local.js";
  import {
    getShoppingListItem,
    getShoppingListNewItem,
    updateItem,
    categoryList
  } from "../components/Database.js";

  import { Button } from "smelte";
  import { TextField } from "smelte";
  import { Select } from "smelte";
  import { AppBar } from "smelte";

  import { fade } from "svelte/transition";
  import { pop } from "svelte-spa-router";

  import { onMount, onDestroy } from "svelte";

  export let params = {};

  var item = {};
  var isDirty = true;

  // Load values
  if (params.action == "new") {
    item = getShoppingListNewItem();
    item.categoryId = ((params.id == undefined) ? '' : params.id) ;
  } else {
    // We enter this form with an existing item Id in that case
    item = getShoppingListItem(params.id);
  }

  var selectCategories = $categoryList.map( oneItem => ({ value: oneItem._id, text: oneItem.category }));

  function saveItem() {
    updateItem(item);
  }

  onMount( async () => document.getElementById("produit").focus());

  onDestroy( async () => {
    if (isDirty) saveItem();
  });

  function back() {
    if (item.produit == "") item.produit = $local.empty;
    saveItem();
    isDirty = false;
    pop();
  }
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:visible">
      <Button
        icon="keyboard_backspace"
        small
        flat
        color="white"
        text
        on:click={back} />
    </div>
    <h6 class="pl-3 text-white tracking-widest font-thin text-lg">
      {$local.product}
    </h6>
  </AppBar>

  <TextField
    id="produit"
    bind:value={item.produit}
    label={$local.product}
    outlined
    type="text"
    min="3"
    max="100" />

  <TextField
    id="detail"
    bind:value={item.detail}
    label={$local.detail}
    outlined
    textarea
    type="text"
    min="3"
    max="500" />
  
  <Select bind:value={item.categoryId} label={$local.category} items={selectCategories} />

</div>
