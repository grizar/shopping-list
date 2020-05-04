<script>
  import { local } from "../components/Local.js";
  import {
    getShoppingListNewItem,
    getShoppingListItem,
    updateItem,
    categoryList,
    openDb,
    runOnCordova
  } from "../components/Database.js";

  import { Button } from "smelte";
  import { TextField } from "smelte";
  import { Select } from "smelte";
  import { AppBar } from "smelte";

  import { fade } from "svelte/transition";
  import { pop, push } from "svelte-spa-router";

  import { onMount, onDestroy } from "svelte";
  import { sansAccent } from "../utils/utils.js"

  export let params = {};

  var item = {};
  var saveOnDestroy = true;


  var selectCategories = $categoryList.map( oneItem => ({ value: oneItem._id, text: oneItem.category }));
  selectCategories = selectCategories.sort(compareCategories);

  function compareCategories(cat1, cat2) {
    return (sansAccent(cat1.text.toUpperCase()) > sansAccent(cat2.text.toUpperCase())) ? 1 : -1;
  }

  function saveItem(doPop = true) {
    if (item.produit == "") item.produit = $local.empty;
    updateItem(item);
    saveOnDestroy = false;
    if (doPop) pop();
  }

    // Load values
    if (params.action == "new") {
      item = getShoppingListNewItem();
      item.categoryId = ((params.id == undefined) ? '' : params.id) ;
    } else {
      // We enter this form with an existing item Id in that case
      item = getShoppingListItem(params.id);
      if (item == undefined) {
        // Only happen if we reload the page directly
        item = getShoppingListNewItem();
        saveOnDestroy = false;
        push('#/');
      }
    }

  onMount( async () => {
    document.getElementById("produit").focus();
  });
    

  onDestroy( async () => {
    if (saveOnDestroy) saveItem(false);
  });

  function back() {
    saveItem();
  }

  function barcodeScan() {
    cordova.plugins.barcodeScanner.scan(
      function (result) {
          alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
      },
      function (error) {
          alert("Scanning failed: " + error);
      },
      {
          preferFrontCamera : true, // iOS and Android
          showFlipCameraButton : true, // iOS and Android
          showTorchButton : true, // iOS and Android
          torchOn: true, // Android, launch with the torch switched on (if available)
          saveHistory: true, // Android, save scan history (default false)
          prompt : "Place a barcode inside the scan area", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations : true, // iOS
          disableSuccessBeep: false // iOS and Android
      }
   );
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
    <h6 class="md:pl-3 text-white text-lg">
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

  <Select bind:value={item.categoryId} label={$local.category} items={selectCategories} dense noUnderline class="mb-6" />

  <TextField
    id="detail"
    bind:value={item.detail}
    label={$local.detail}
    outlined
    textarea
    type="text"
    min="3"
    max="500" />

    {#if $runOnCordova}
          <Button light on:click={barcodeScan}></Button>
    {/if}

</div>
