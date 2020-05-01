<script>
  import { local } from "../components/Local.js";
  import {
    getCategoryListItem,
    getCategoryListNewItem,
    updateCategory
  } from "../components/Database.js";

  import { Button } from "smelte";
  import { TextField } from "smelte";
  import { AppBar } from "smelte";

  import { fade } from "svelte/transition";
  import { push, pop, location, querystring } from "svelte-spa-router";

  import { onMount, onDestroy } from "svelte";

  export let params = {};

  var item = {};
  var isDirty = true;

  // Load values
  if (params.action == "new") {
    item = getCategoryListNewItem();
  } else {
    item = getCategoryListItem(params.id);
  }

  function saveCategory() {
      updateCategory(item);
  }

  onMount( async () => document.getElementById("category").focus());

  onDestroy( async () => {
    if (isDirty) saveCategory();
  });

  function back() {
    if (item.category == "") item.category = $local.empty;
    saveCategory();
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
      {$local.category}
    </h6>
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
