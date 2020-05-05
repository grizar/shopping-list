<script>
  import { local, locLanguages, setLocal } from "../components/Local.js";
  import { allParams, setParams } from "../components/Database.js";

  import { TextField } from "smelte";
  import { Checkbox } from "smelte";
  import { Select } from "smelte";
  import { AppBar } from "smelte";
  import { Button } from "smelte";
  import { RadioButtonGroup } from "smelte";

  import { onDestroy } from "svelte";
  import { push } from "svelte-spa-router";

  import { fade } from "svelte/transition";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  


  var serverName = "";
  var serverNameError = "";
  var serverPort = "";
  var serverPortError = "";
  var serverDb = "";
  var serverDbError = "";

  var showPurchasedAtTheEnd = true;
  var allwaysShowDeleteButton = false;
  var showEmptyCategory = false;
  var longPressToEdit = false;

  var saveOnDestroy = true;

  $: {
    serverPortError =
      serverPort == undefined || serverPort == ""
        ? ""
        : Number(serverPort) <= 1000 || Number(serverPort) > 9999
        ? $local.portError
        : "";
  }
  $: {
    serverNameError =
      serverName == undefined || serverName == ""
        ? ""
        : serverName.length <= 3
        ? $local.min3chars
        : "";
  }
  $: {
    serverDbError =
      serverDb == undefined || serverDb == ""
        ? ""
        : serverDb.length <= 3
        ? $local.min3chars
        : "";
  }

  if (Object.keys($allParams).length === 0) {
    // Shall only happen if we reload the page directly
    saveOnDestroy = false;
    push('#/');
  }
  serverName = $allParams.server;
  serverPort = $allParams.port;
  serverDb = $allParams.database;
  showPurchasedAtTheEnd = $allParams.showPurchasedAtTheEnd;
  allwaysShowDeleteButton = $allParams.allwaysShowDeleteButton;
  showEmptyCategory = $allParams.showEmptyCategory;
  longPressToEdit = $allParams.longPressToEdit;
 
  onDestroy(async () => {
    if (!saveOnDestroy) return;
    
    var isOk;
    if (serverName == "" && serverPort == "" && serverDb == "") {
      isOk = true;
    } else if (
      serverNameError != "" ||
      serverPortError != "" ||
      serverDbError != ""
    ) {
      isOk = false;
    } else if (serverName == "" || serverPort == "" || serverDb == "") {
      isOk = false;
    } else {
      isOk = true;
    }

    if (isOk) {
      $allParams.protocol = "http";
      $allParams.server = serverName;
      $allParams.port = serverPort;
      $allParams.database = serverDb;
      $allParams.showPurchasedAtTheEnd = showPurchasedAtTheEnd;
      $allParams.allwaysShowDeleteButton = allwaysShowDeleteButton;
      $allParams.showEmptyCategory = showEmptyCategory;
      $allParams.longPressToEdit = longPressToEdit;
      setParams($allParams);

      dispatch("routeEvent", {
        action: "displaySnackbar",
        message: $local.parametersSaved,
        color: "gray"
      });
    } else {
      dispatch("routeEvent", {
        action: "displaySnackbar",
        message: $local.parametersError,
        color: "error"
      });
    }
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
    <h6 class="md:pl-3 text-white text-lg">
      {$local.settings}
    </h6>
  </AppBar>

  <h6><b><u>{$local.displaySection}</u></b></h6>
  <br>
        <Checkbox
          label={$local.showPurchasedAtTheEnd}
          bind:checked={showPurchasedAtTheEnd} />
        <Checkbox
          label={$local.allwaysShowDeleteButton}
          bind:checked={allwaysShowDeleteButton} />
        <Checkbox
          label={$local.showEmptyCategory}
          bind:checked={showEmptyCategory} />
        <Checkbox
          label={$local.longPressToEdit}
          bind:checked={longPressToEdit} />

        <Select
          label={$local.language}
          items={$locLanguages}
          bind:value={$allParams.language}
          on:change={setLocal($allParams.language)} />

        <span>{$local.fontSize}</span>
          <RadioButtonGroup classes="flex-col3" bind:selected={$allParams.fontSize} name="fontSize" items={[{ value: 'text-sm', label: 'A', classes:'text-sm' }, { value: 'text-base', label: 'A', classes:'text-base' } , { value: 'text-lg', label: 'A', classes:'text-lg' }]} />
  <hr><br>
  <h6><b><u>{$local.couchdbConf}</u></b></h6>
  <br>
        <TextField
          id="servername"
          bind:value={serverName}
          label={$local.serverName}
          prepend="computer"
          type="text"
          min="3"
          max="100"
          error={serverNameError} />

        <TextField
          id="port"
          bind:value={serverPort}
          label={$local.port}
          prepend="settings_input_svideo"
          type="number"
          min="0"
          max="9999"
          error={serverPortError} />

        <TextField
          id="database"
          bind:value={serverDb}
          label={$local.databaseName}
          prepend="folder_open"
          type="text"
          min="3"
          max="100"
          error={serverDbError} />
  <hr><br>
  <h6><b><u>{$local.creditSection}</u></b></h6>
  <br>
  <p>Icon made by Smashicons from www.flaticon.com</p>
  <p>Material icons by Google</p>

</div>
