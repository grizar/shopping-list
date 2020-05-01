<script context="module">

  import PouchDB from "pouchdb-browser";
  import { writable } from "svelte/store";
  import { setLocal } from "./Local.svelte";

  const shoppingList = writable([]);
  export { shoppingList }

  var currentParams = {};
  const allParams = writable(currentParams);
  export { allParams }
  var replicationString = "";

  export async function openDb() {
    await openParamDb()
    openShoppingDb();
  }

  // All the shopping directly from the PouchDB. Sorting and filtering comes later
  // Also, a param db will be used, but not synched
  var shoppingDb;
  var paramDb;
  
  async function openParamDb() {
   // Open the param db
    paramDb = new PouchDB("param");
    await readParams();  
  }

  async function readParams() {

    var allDocs = await paramDb.allDocs({
      include_docs: true
    });
    if (allDocs.rows.length > 0 ) {
      currentParams = allDocs.rows[0].doc;
    }

    // Upgrade parameter object to latest parameters set
    if (currentParams.protocol == undefined) currentParams.protocol = '';
    if (currentParams.server == undefined) currentParams.server = '';
    if (currentParams.port == undefined) currentParams.port = '';
    if (currentParams.database == undefined) currentParams.database = '';
    if (currentParams.showPurchasedAtTheEnd == undefined) currentParams.showPurchasedAtTheEnd = true;
    if (currentParams.allwaysShowDeleteButton == undefined) currentParams.allwaysShowDeleteButton = false;
    if (currentParams.language == undefined) currentParams.language = 'auto';

    allParams.set(currentParams);

    // Settings the language
    setLocal(currentParams.language);

    // Creation replication string
    replicationString = "";
    if (currentParams.protocol != "" && currentParams.server != "" && currentParams.port != "" && currentParams.database != "") {
    // Populate the couchdb server string only when all parameters are set
      replicationString = currentParams.protocol + "://" + currentParams.server + ":" + currentParams.port + "/" + currentParams.database;
    }
  }

  export async function setParams(params) {
    var action;
    currentParams = params;
    if (params._id == undefined) {
      // First time we save the params
      action = await paramDb.post(params);
    } else {
      // Already existing param records
      action = await paramDb.put(params);
    }

    if (action.ok) {
      // Save or creation is Ok, we reopen all databases
      openDb();
    }
  }

  // Set up local PouchDB and continuous replication to remote CouchDB

  async function openShoppingDb() {
    shoppingDb = new PouchDB("shopping");
    await updateShoppingList();
    if (replicationString != "") {
      const replication = PouchDB.sync("shopping",replicationString, { live: true, retry: true })

      replication.on("change", async function(info) {
        await updateShoppingList();
      })
      .on("error", function(err) {
        console.log("Replication error:", err);
      });
    }
  }

  export function getShoppingList() {
    return shoppingList;
  }
 // Helper for reloading all todos from the local PouchDB. It’s on-device and has basically zero latency,
  // so we can use it quite liberally instead of keeping our local state up to date like you’d do
  // in a Redux reducer. It also saves us from having to rebuild the local state todos from the data we sent
  // to the database and the `_id` and `_rev` values that were sent back.
  export async function updateShoppingList() {
    const allDocs = await shoppingDb.allDocs({
      include_docs: true
    });
    var allItems = allDocs.rows.map(row => row.doc);
    var produits = allItems.filter(item => item.type === 'produit');
    if (currentParams.showPurchasedAtTheEnd) {
      produits = produits.sort(compareItemPurchasedEnd);
    } else {
      produits = produits.sort(compareItem);
    }
    shoppingList.set(produits);
  }

  function compareItemPurchasedEnd(item1, item2) {
    var result = (item1.coche === item2.coche)? (item1.produit.toUpperCase() > item2.produit.toUpperCase()) : (item1.coche);
    return (result ? 1 : -1);
  }

  function compareItem(item1, item2) {
    return (item1.produit.toUpperCase() > item2.produit.toUpperCase()) ? 1 : -1;
  }
  // Event handlers for adding, updating and removing todos
  export async function addItem(produit) {
    const newItem = {
      type: 'produit',
      coche: false,
      produit: produit
    };
    const addition = await shoppingDb.post(newItem);
    if (addition.ok) {
      await updateShoppingList();
    }
  }

  export async function updateItem(itemToUpdate) {
    const update = await shoppingDb.put(itemToUpdate);
    if (update.ok) {
      await updateShoppingList();
    }
  }

  export async function removeItem(itemToRemove) {
    const removal = await shoppingDb.remove(itemToRemove);
    if (removal.ok) {
      // For removal, we can just update the local state instead of reloading everything from PouchDB,
      // since we no longer care about the doc’s revision.
      shoppingList.update( items => items.filter(item => item._id !== itemToRemove._id ));
    }
  }



</script>