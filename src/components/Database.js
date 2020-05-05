
  import PouchDB from "pouchdb-browser";
  import { writable } from "svelte/store";
  import { setLocal } from "./Local.js";
  import { sansAccent} from "../utils/utils.js"

  // Share the cordova status everywhere
  var runOnCordova = writable(false);
  export { runOnCordova }

  // Variable share in the whole application
  var currentShoppingList = [];
  const shoppingList = writable([]);
  export { shoppingList }

  var currentCategoryList = [];
  const categoryList = writable([]);
  export { categoryList }

  var currentParams = {};
  const allParams = writable(currentParams);
  export { allParams }
  var replicationString = "";

  export async function openDb() {
    await openParamDb()
    await openShoppingDb();
  }

  // All the shopping directly from the PouchDB. Sorting and filtering comes later
  // Also, a param db will be used, but not synched
  var shoppingDb;
  var paramDb;
  
  async function openParamDb() {
   // Open the param db
    // if (paramDb != undefined) return;
    paramDb = new PouchDB("param", {auto_compaction: true});
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
    if (currentParams.showEmptyCategory == undefined) currentParams.showEmptyCategory = false;
    if (currentParams.longPressToEdit == undefined) currentParams.longPressToEdit = false;
    if (currentParams.language == undefined) currentParams.language = 'auto';
    if (currentParams.fontSize == undefined) currentParams.fontSize = 'text-sm';

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
    await updateList();
    if (replicationString != "") {
      const replication = PouchDB.sync("shopping",replicationString, { live: true, retry: true })

      replication.on("change", async function(info) {
        await updateList();
      })
      .on("error", function(err) {
        console.log("Replication error:", err);
      });
    }
  }
  
  // Helper for reloading all todos from the local PouchDB. It’s on-device and has basically zero latency,
  // so we can use it quite liberally instead of keeping our local state up to date like you’d do
  // in a Redux reducer. It also saves us from having to rebuild the local state todos from the data we sent
  // to the database and the `_id` and `_rev` values that were sent back.
  export async function updateList() {
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
    currentShoppingList = produits;

    var categories = allItems.filter(item => item.type === 'category');
    categories = categories.sort(compareCategory);
    categoryList.set(categories);
    currentCategoryList = categories;
  }

  function compareItemPurchasedEnd(item1, item2) {
    if ((bin(item1.coche) == bin(item2.coche))) {
      return compareItem(item1,item2);
    } else {
      return (bin(item1.coche) ? 1 : -1)
    }
  }

  function bin(value) {
    return ( value == undefined ? false : value);
  }

  function compareItem(item1, item2) {
    return (sansAccent(item1.produit.toUpperCase()) > sansAccent(item2.produit.toUpperCase())) ? 1 : -1;
  }

  function compareCategory(item1, item2) {
    return (sansAccent(item1.category.toUpperCase()) > sansAccent(item2.category.toUpperCase())) ? 1 : -1;
  }  

  // Event handlers for adding, updating and removing todos
  export async function addItem(produit) {
    const newItem = getShoppingListNewItem(produit);
    await updateItem(newItem);
  }

  export async function updateItem(item) {
    var result;
    if ( item._id == undefined) {
      result = await shoppingDb.post(item);
    } else {
      result = await shoppingDb.put(item);
    }
    if (result.ok) {
      await updateList();
    }
  }

  export async function removeItem(item) {
    const removal = await shoppingDb.remove(item);
    if (removal.ok) {
      // For removal, we can just update the local state instead of reloading everything from PouchDB,
      // since we no longer care about the doc’s revision.
      shoppingList.update( items => items.filter(oneItem => oneItem._id !== item._id ));
    }
  }

  export function getShoppingListItem(id) {
    var produit = currentShoppingList.filter(oneItem => oneItem._id == id);
    return produit[0];
  }

  export function getShoppingListNewItem(produit = '', detail = '', coche = false, categoryId = '') {
    return {
      type: 'produit',
      produit: produit,
      coche: coche,
      detail: detail,
      categoryId : categoryId
    };
  }

  // Event handlers for adding, updating and removing categories
  export async function addCategory(category) {
    const newItem = getCategoryListNewItem(category);
    await updateCategory(newItem);
  }

  export async function updateCategory(category) {
    var result;
    if (category._id == undefined) {
      result = await shoppingDb.post(category);
    } else {
      result = await shoppingDb.put(category);
    }
    if (result.ok) {
      await updateList();
    }
  }

  export async function removeCategory(category) {
    const removal = await shoppingDb.remove(category);
    if (removal.ok) {
      // For removal, we can just update the local state instead of reloading everything from PouchDB,
      // since we no longer care about the doc’s revision.
      categoryList.update( items => items.filter(oneItem => oneItem._id !== category._id ));

      // Now, we remove the category Id of all related items
      for (const item of currentShoppingList) {
        if (item.categoryId == category._id) {
          item.categoryId = '';
          await shoppingDb.put(item);
        }
      }
      await updateList();
    }
  }

  export function getCategoryListItem(id) {
    var category = currentCategoryList.filter(oneItem => oneItem._id == id);
    return category[0];
  }

  export function getCategoryListNewItem(category = '', detail = '') {
    return {
      type: 'category',
      category: category,
      detail: detail
    };
  }
  


