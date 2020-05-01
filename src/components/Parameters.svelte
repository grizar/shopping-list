<script>
  import { TextField } from "smelte";
  import { Checkbox } from "smelte";
  import { Select } from "smelte";

  import { onMount, onDestroy } from "svelte";
  import { allParams, setParams } from "./Database.svelte";

  import { local,locLanguages, setLocal } from "./Local.svelte";

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

  $: {
    serverPortError =
      serverPort == ""
        ? ""
        : Number(serverPort) <= 1000 || Number(serverPort) > 9999
        ? $local.portError
        : "";
  }
  $: {
    serverNameError =
      serverName == "" ? "" : serverName.length <= 3 ? $local.min3chars : "";
  }
  $: {
    serverDbError =
      serverDb == "" ? "" : serverDb.length <= 3 ? $local.min3chars : "";
  }

  onMount(async () => {
    serverName = $allParams.server;
    serverPort = $allParams.port;
    serverDb = $allParams.database;
    showPurchasedAtTheEnd = $allParams.showPurchasedAtTheEnd;
    allwaysShowDeleteButton = $allParams.allwaysShowDeleteButton;
    // document.getElementById("servername").focus();
  });

  onDestroy(() => {
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
      setParams($allParams);

      dispatch("message", {
        message: $local.parametersSaved,
        color: "gray"
      });
    } else {
      dispatch("message", {
        message: $local.parametersError,
        color: "error"
      });
    }
  });
</script>

<h6><u>{$local.displaySection}</u></h6>
<Checkbox
  label={$local.showPurchasedAtTheEnd}
  bind:checked={showPurchasedAtTheEnd} />
<Checkbox
  label={$local.allwaysShowDeleteButton}
  bind:checked={allwaysShowDeleteButton} />
<Select label={$local.language} items={$locLanguages} bind:value={$allParams.language} on:change={setLocal($allParams.language)}/>

<hr />
<br />
<h6><u>{$local.couchdbConf}</u></h6>
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




