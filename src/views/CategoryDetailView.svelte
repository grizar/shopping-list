<script>
  import {
    local,
    database
  } from "../components/state.js";
  import { Button } from "smelte";
  import { TextField } from "smelte";
  import { AppBar } from "smelte";

  import { fade } from "svelte/transition";
  import { pop, push } from "svelte-spa-router";

  import { onMount, onDestroy } from "svelte";

  export let params = {};

  var item = {};
  var saveOnDestroy = true;

  function saveCategory(doPop = true) {
    if (item.category == "") item.category = $local.empty;
    database.updateCategory(item);
    saveOnDestroy = false;
    if (doPop) pop();
  }

  // Load values
  if (params.action == "new") {
    item = database.getCategoryListNewItem();
  } else {
    item = database.getCategoryListItem(params.id);
    if (item == undefined) {
      // Only happen if we reload the page directly
      item = database.getCategoryListNewItem();
      saveOnDestroy = false;
      push("#/categories");
    }
  }

  onMount(async () => {
    document.getElementById("category").focus();
  });

  onDestroy(async () => {
    if (saveOnDestroy) saveCategory(false);
  });

  function back() {
    saveCategory();
  }
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:visible">
      <Button
        icon="keyboard_backspace"
        flat
        color="white"
        text
        on:click={back} />
    </div>
    <h6 class="md:pl-3 text-white text-lg">{$local.category}</h6>
  </AppBar>

  <TextField
    id="category"
    bind:value={item.category}
    label={$local.category}
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

</div>
