<script>
  export let name;

  import "smelte/src/tailwind.css";

  import { onMount } from "svelte";

  import { TextField } from "smelte";
  import { Button } from "smelte";
  import { AppBar } from "smelte";
  import { Dialog } from "smelte";
  import { Snackbar } from "smelte";
  import { NavigationDrawer } from "smelte";
  import { List } from "smelte";
  import { ListItem } from "smelte";
  import { fade } from "svelte/transition";

  import ItemList from "./components/ItemList.svelte";
  import Parameters from "./components/Parameters.svelte";

  import {
    shoppingList,
    openDb,
    updateShoppingList,
    addItem,
    updateItem,
    removeItem
  } from "./components/Database.svelte";

  import { local } from "./components/Local.svelte";

  import Router from 'svelte-spa-router';
  
  // routes
  const routes = {
    // Exact path
    '/': Home,
 
    // Using named parameters, with last being optional
    '/settings': Parameters,
 
    // Catch-all
    // This is optional, but if present it must be the last
    '*': Home
}
  var currentRoute = "";


  var usingCordova = ("usingCordova" in window) ;
  if (usingCordova) {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
      // Now safe to use device APIs
      initApp();
    }
  } else {
    // Open websocket when running in a browser
    onMount(async () => {
      initApp();
    });
  }


  // Load shopping list on first run

  async function initApp() {
    // Set up local PouchDB and continuous replication to remote CouchDB
    await openDb();
    await updateShoppingList();
    currentRoute = "shoppingList";
  }
  // Add dialog
  var showAddDialog = false;
  var item = "";

  function cancelAddDialog() {
    item = "";
    showAddDialog = false;
  }

  function submitAddDialog() {
    addItem(item);
    snackbarMessage = item + ' ' + $local.added;
    snackbarColor = "gray";
    showSnackbar = true;
    item = "";
    showAddDialog = false;
  }

  function openAddDialog() {
    item = "";
    showAddDialog = true;
  }

  // Drawer functions & global variables
  var showNav = false;
  var showNavOpenByButton = false;
  var menuItems = [];
  $: {
  menuItems = [{ id: 1, icon: "", text: $local.all, category:$local.all , dividerBefore: false, route: "shoppingList" }, { id: 2, icon: "settings", text: $local.parameters, category: "", dividerBefore: true, route: "param"}];
  }
  var currentMenuId = 1;
  var currentCategory = "";
  $: {
    $local['all'];
  }
  
  function openDrawer() {
    showNav = true;
    showNavOpenByButton = true;
  }

  function closeDrawer() {
    if (!showNavOpenByButton) return;
    showNav = false;
    showNavOpenByButton = false;
  }

  function selectMenu(item) {
    currentCategory = item.category;
    currentMenuId = item.id;
    currentRoute = item.route;
    if (showNavOpenByButton) showNav = false;
    showNavOpenByButton = false;
  }

  // Snack bar
  var showSnackbar = false;
  var snackbarMessage = "";
  var snackbarColor = "";

  function handleParametersMessage(event) {
    snackbarMessage = event.detail.message;
    snackbarColor = event.detail.color;
    showSnackbar = true;
  }
  
</script>

<AppBar class="bg-blue-400">
  <div class="md:hidden">
    <Button icon="menu" small flat color="white" text on:click={openDrawer} />
  </div>
  <h6 class="pl-3 text-white tracking-widest font-thin text-lg">{name}</h6>
</AppBar>


<Dialog persistent bind:value={showAddDialog}>
  <h5 slot="title">{$local['newItem']}</h5>
  <TextField
    id="produit"
    bind:value={item}
    label={$local.product}
    outlined
    type="text"
    min="3"
    max="100" />
  <div slot="actions">
    <Button text on:click={cancelAddDialog}>{$local.cancel}</Button>
    <Button
      disabled={item == '' || item.length < 3}
      text
      on:click={submitAddDialog}>
      {$local.ok}
    </Button>
  </div>
  <script>
    document.getElementById("produit").focus();
  </script>
</Dialog>

<Snackbar bind:value={showSnackbar} color={snackbarColor}>
  <div>{snackbarMessage}</div>
</Snackbar>

<main
  class="container relative p-8 lg:max-w-5xl lg:ml-64 mx-auto mb-6 mt-10  md:ml-64 md:max-w-md md:px-">

<NavigationDrawer bind:show={showNav}>
  <List items={menuItems}>
    <span slot="item" let:item class="cursor-pointer">
      {#if item.dividerBefore}
        <hr />
      {/if}
      <a href="#!" on:click={selectMenu(item)}>
        <ListItem
          icon={item.icon}
          {...item}
          dense
          selected={currentMenuId == item.id} />
      </a>
    </span>
  </List>
</NavigationDrawer>


{#if currentRoute=="param"}
  <div transition:fade|local>
    <Parameters on:message={handleParametersMessage} />
  </div>
{/if}

{#if currentRoute=="shoppingList"}
  <div transition:fade|local>
  <ItemList items={$shoppingList} />
  </div>
{/if}

</main>

{#if currentRoute=="shoppingList"}
<div class="fixed px-5 py-5 bottom-0 right-0">
  <Button color="error" icon="add" on:click={openAddDialog} />
</div>
{/if}
