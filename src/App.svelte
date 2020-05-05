<script>

  import "smelte/src/tailwind.css";

  import { onMount } from "svelte";

  import { Snackbar } from "smelte";
  import { NavigationDrawer } from "smelte";
  import { List } from "smelte";
  import { ListItem } from "smelte";
  import { fade } from "svelte/transition";

  import ItemListView from "./views/ItemListView.svelte";
  import ItemDetailView from "./views/ItemDetailView.svelte";  
  import CategoryListView from "./views/CategoryListView.svelte";
  import CategoryDetailView from "./views/CategoryDetailView.svelte";  
  import ParameterView from "./views/ParameterView.svelte";

  import {
    shoppingList,
    categoryList,
    openDb,
    allParams,
    runOnCordova
  } from "./components/Database.js";

  import { local } from "./components/Local.js";

  import Router from 'svelte-spa-router';
  import {location} from 'svelte-spa-router';

  // Manage the cordova satus
  $runOnCordova = ("usingCordova" in window);

  // routes
  const routes = {
    // Exact path
    '/': ItemListView,
    '/items/:id?': ItemListView,
    '/item/:action/:id?': ItemDetailView,
    '/categories': CategoryListView,
    '/category/:action/:id?': CategoryDetailView,
    '/settings': ParameterView 
}

  if ($runOnCordova) {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
      // Now safe to use device APIs
      initApp();
    }
  } else {
    onMount(async () => {
      await initApp();
    });
  }


  // Load shopping list on first run
  async function initApp() {
    // Set up local PouchDB and continuous replication to remote CouchDB
    await openDb();
  }
  
  // Drawer functions & global variables
  var showNav = false;
  var showNavOpenByButton = false;
  var menuItems = [];
  $: {
    menuItems = [
      { id: 1, icon: "", to: "#/", text: $local.all , dividerBefore: false } 
    ];

    menuItems.push(...$categoryList.map( item => ({ to: '#/items/' + item._id, text: item.category })));
    if ($allParams.showEmptyCategory) {
      menuItems.push({ to: '#/items/null', text: $local.emtpyCategory });  
    }
    
    menuItems.push(...[ 
      { id: 2, icon: "storage", to:'#/categories', text: $local.categories, dividerBefore: true},
      { id: 3, icon: "settings", to:'#/settings', text: $local.parameters, dividerBefore: false}
    ]);
  }

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
    if (showNavOpenByButton) showNav = false;
    showNavOpenByButton = false;
  }

  // Snack bar
  var showSnackbar = false;
  var snackbarMessage = "";
  var snackbarColor = "";

  function routeEvent(event) {
    if (event.detail.action == 'displaySnackbar') {
      snackbarMessage = event.detail.message;
      snackbarColor = event.detail.color;
      showSnackbar = true;
    } else if (event.detail.action == 'openDrawer') {
      openDrawer();
    }
  }

</script>


<Snackbar bind:value={showSnackbar} color={snackbarColor}>
  <div>{snackbarMessage}</div>
</Snackbar>


<main
  class="container relative p-8 lg:max-w-5xl lg:ml-64 mx-auto mb-6 mt-10  md:ml-64 md:max-w-md md:px- {$allParams.fontSize}">

<NavigationDrawer bind:show={showNav}>
  <List items={menuItems}>
    <span slot="item" let:item class="cursor-pointer">
      {#if item.dividerBefore}
        <hr />
      {/if}
      <a href={item.to} on:click={selectMenu(item)}>
        <ListItem
          icon={item.icon} class="truncate"
          text={item.text}
          dense
          selected={ ($location == item.to) || ('#' + $location == item.to)} />
      </a>
    </span>
  </List>
</NavigationDrawer>

<Router {routes} on:routeEvent={routeEvent}/>

</main>
