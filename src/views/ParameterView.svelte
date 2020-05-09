<script>
  import {
    parameters,
    local,
    locLanguages,
    database
  } from "../components/state.js";

  import { TextField } from "smelte";
  import { Checkbox } from "smelte";
  import { Select } from "smelte";
  import { AppBar } from "smelte";
  import { Button } from "smelte";
  import { RadioButtonGroup } from "smelte";

  import { onDestroy } from "svelte";
  import { push, location } from "svelte-spa-router";

  import { fade } from "svelte/transition";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  var serverName;
  $: {
    // We put this line to force svelte to listen to the parameter change and then save the parameters
    serverName = $parameters.server;
    parameters.saveParams();
  }

  // Save current location
  $parameters.startLocation = $location;

  onDestroy(async () => {
    database.openDb();
  });

  function openDrawer() {
    dispatch("routeEvent", { action: "openDrawer" });
  }
</script>

<div in:fade>
  <AppBar class="bg-blue-400">
    <div class="md:hidden">
      <Button icon="menu" flat color="white" text on:click={openDrawer} />
    </div>
    <h6 class="md:pl-3 text-white text-lg">{$local.settings}</h6>
  </AppBar>

  <h6>
    <b>
      <u>{$local.displaySection}</u>
    </b>
  </h6>
  <br />
  <Checkbox
    label={$local.showPurchasedAtTheEnd}
    bind:checked={$parameters.showPurchasedAtTheEnd} />
  <Checkbox
    label={$local.allwaysShowDeleteButton}
    bind:checked={$parameters.allwaysShowDeleteButton} />
  <Checkbox
    label={$local.showEmptyCategory}
    bind:checked={$parameters.showEmptyCategory} />
  <Checkbox
    label={$local.longPressToEdit}
    bind:checked={$parameters.longPressToEdit} />

  <Select
    label={$local.language}
    items={$locLanguages}
    bind:value={$parameters.language}
    on:change={local.setLocal($parameters.language)} />

  <span>{$local.fontSize}</span>
  <RadioButtonGroup
    classes="flex-col3"
    bind:selected={$parameters.fontSize}
    name="fontSize"
    items={[{ value: 'text-sm', label: 'A', classes: 'text-sm' }, { value: 'text-base', label: 'A', classes: 'text-base' }, { value: 'text-lg', label: 'A', classes: 'text-lg' }]} />
  <hr />
  <br />
  <h6>
    <b>
      <u>{$local.couchdbConf}</u>
    </b>
  </h6>
  <br />
  <TextField
    id="servername"
    bind:value={$parameters.server}
    label={$local.serverName}
    prepend="computer"
    type="text"
    min="3"
    max="100" />

  <TextField
    id="port"
    bind:value={$parameters.port}
    label={$local.port}
    prepend="settings_input_svideo"
    type="number"
    min="0"
    max="9999" />

  <TextField
    id="database"
    bind:value={$parameters.database}
    label={$local.databaseName}
    prepend="folder_open"
    type="text"
    min="3"
    max="100" />
  <hr />
  <br />
  <h6>
    <b>
      <u>{$local.creditSection}</u>
    </b>
  </h6>
  <br />
  <p>Icon made by Smashicons from www.flaticon.com</p>
  <p>Material icons by Google</p>

</div>
