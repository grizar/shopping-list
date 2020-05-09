import { writable, get } from "svelte/store";
import PouchDB from "pouchdb-browser";

export const locLanguages = writable([{ value: 'auto', text: 'Auto' }, { value: 'FR', text: 'Français' }, { value: 'EN', text: 'English' }]);
export const runOnCordova = writable(false);
export const parameters = createParams();
export const local = createLocal();
export const shoppingList = writable([]);
export const categoryList = writable([]);

var db;

// ****************************************************************************************
// Utilities
// ****************************************************************************************

function sansAccent(str) {
  var accent = [
    /[\300-\306]/g, /[\340-\346]/g, // A, a
    /[\310-\313]/g, /[\350-\353]/g, // E, e
    /[\314-\317]/g, /[\354-\357]/g, // I, i
    /[\322-\330]/g, /[\362-\370]/g, // O, o
    /[\331-\334]/g, /[\371-\374]/g, // U, u
    /[\321]/g, /[\361]/g, // N, n
    /[\307]/g, /[\347]/g, // C, c
  ];
  var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

  for (var i = 0; i < accent.length; i++) {
    str = str.replace(accent[i], noaccent[i]);
  }
  return str;

  return str;
}

// ****************************************************************************************

function readParams(params) {

  function getString(key, defaultValue) {
    var value = localStorage.getItem(key);
    return (value == 'undefined') ? defaultValue : value;
  }

  function getBoolean(key, defaultValue) {
    var value = localStorage.getItem(key);
    return (value == 'undefined') ? defaultValue : (value == "1" ? true : false);
  }

  // Upgrade parameter object to latest parameters set
  params.protocol = getString('protocol', 'http');
  params.server = getString('server', '');
  params.port = getString('port', '');
  params.database = getString('database', '');
  params.showPurchasedAtTheEnd = getBoolean('showPurchasedAtTheEnd', true);
  params.allwaysShowDeleteButton = getBoolean('allwaysShowDeleteButton', false);
  params.longPressToEdit = getBoolean('longPressToEdit', false);
  params.showEmptyCategory = getBoolean('showEmptyCategory', false);
  params.language = getString('language', 'auto');
  params.fontSize = getString('fontSize', 'text-sm');
  params.startLocation = getString('startLocation', '#/');

  return params;
}

function saveParams(params) {

  function saveString(key, value) {
    localStorage.setItem(key, value);
  }
  function saveBoolean(key, value) {
    saveString(key, (value ? "1" : "0"));
  }

  saveString('protocol', params.protocol);
  saveString('server', params.server);
  saveString('port', params.port);
  saveString('database', params.database);
  saveBoolean('showPurchasedAtTheEnd', params.showPurchasedAtTheEnd);
  saveBoolean('allwaysShowDeleteButton', params.allwaysShowDeleteButton);
  saveBoolean('longPressToEdit', params.longPressToEdit);
  saveBoolean('showEmptyCategory', params.showEmptyCategory);
  saveString('language', params.language);
  saveString('fontSize', params.fontSize);
  saveString('startLocation', params.startLocation);

  // Does not perform any change to the state
  return params;

}

// Local mgt
// *********

export function setLocal(local, lang) {

  const defaultLang = window.navigator.language.slice(0, 2).toUpperCase();
  var selectedLanguage = (lang == 'auto') ? defaultLang : lang;

  var loc = {};
  switch (selectedLanguage) {
    case 'FR':
      loc = {
        // App.svelte
        appname: 'My Shopping List',
        categories: 'Catégories',
        category: 'Categorie',
        parameters: "Paramètres",
        all: 'Tout',
        cancel: 'Annuler',
        ok: 'OK',
        newItem: 'Nouvel achat ...',
        product: 'Produit',
        added: 'ajouté',
        detail: 'Détails',
        empty: '** vide **',

        // Category
        emtpyCategory: 'Sans catégorie',

        // Parameters.svelte
        settings: 'Paramètres',
        couchdbConf: 'Couchdb',
        serverName: 'Serveur',
        port: 'Port',
        databaseName: 'Base de données',

        displaySection: 'Affichage & comportement',
        showPurchasedAtTheEnd: 'Afficher les achats réalisés en fin de liste ?',
        allwaysShowDeleteButton: 'Toujours afficher le bouton de suppression ?',
        showEmptyCategory: 'Afficher la catégorie vide ?',
        longPressToEdit: 'Appui long pour éditer ?',
        language: 'Langue',
        fontSize: 'Taille police',

        creditSection: 'Crédits',

        // Misc
        scanError: 'Erreur scan : ',
        scanNotFound: 'Produit non trouvé',
        scanPrompt: 'Visez un barcode'

      }
      break;
    case 'EN':
    default:
      loc = {
        // App.svelte
        appname: 'My Shopping List',
        categories: 'Categories',
        category: 'Category',
        parameters: 'Parameters',
        all: 'All',
        cancel: 'Cancel',
        ok: 'OK',
        newItem: 'New product ...',
        product: 'Product',
        added: 'added',
        detail: 'Details',
        empty: '** empty **',

        // Category
        emtpyCategory: 'Empty category',

        // Parameters.svelte
        settings: 'Settings',
        couchdbConf: 'Couchdb',
        serverName: 'Server',
        port: 'Port',
        databaseName: 'Database',

        displaySection: 'Display & behaviour',
        showPurchasedAtTheEnd: 'Display the purchases made at the end of the list?',
        allwaysShowDeleteButton: 'Always show delete button?',
        showEmptyCategory: 'Display empty category?',
        longPressToEdit: 'Long press to edit ?',
        language: 'Language',
        fontSize: 'Font size',

        creditSection: 'Credits',

        // Misc
        scanError: 'Scan error : ',
        scanNotFound: 'Product not found',
        scanPrompt: 'Place a barcode inside the scan area'

      }
      break;
  }

  return loc;
}

export const database = {
  openDb: openDb,
  updateList: updateList,
  addItem: addItem,
  updateItem: updateItem,
  removeItem: removeItem,
  getShoppingListItem: getShoppingListItem,
  getShoppingListNewItem: getShoppingListNewItem,
  addCategory: addCategory,
  removeCategory: removeCategory,
  updateCategory: updateCategory,
  getCategoryListItem: getCategoryListItem,
  getCategoryListNewItem: getCategoryListNewItem,
  compareCategory: compareCategory
}

async function openDb() {
  db = new PouchDB("shopping");
  await updateList();

  var params = get(parameters);
  var replicationString = "";
  if (params.protocol != "" && params.server != "" && params.port != "" && params.database != "") {
    // Populate the couchdb server string only when all parameters are set
    replicationString = params.protocol + "://" + params.server + ":" + params.port + "/" + params.database;
    // Populate the couchdb server string only when all parameters are set
    const replication = PouchDB.sync("shopping", replicationString, { live: true, retry: true })
    replication.on("change", async function (info) {
      await updateList();
    })
      .on("error", function (err) {
        console.log("Replication error:", err);
      });
  }
}


// Helper for reloading all todos from the local PouchDB. It’s on-device and has basically zero latency,
// so we can use it quite liberally instead of keeping our local state up to date like you’d do
// in a Redux reducer. It also saves us from having to rebuild the local state todos from the data we sent
// to the database and the `_id` and `_rev` values that were sent back.
async function updateList() {
  const allDocs = await db.allDocs({
    include_docs: true
  });
  var params = get(parameters);
  var allItems = allDocs.rows.map(row => row.doc);
  var produits = allItems.filter(item => item.type === 'produit');
  if (params.showPurchasedAtTheEnd) {
    produits = produits.sort(compareItemPurchasedEnd);
  } else {
    produits = produits.sort(compareItem);
  }
  shoppingList.set(produits);

  var categories = allItems.filter(item => item.type === 'category');
  categories = categories.sort(compareCategory);
  categoryList.set(categories);
}

function compareItemPurchasedEnd(item1, item2) {
  if ((bin(item1.coche) == bin(item2.coche))) {
    return compareItem(item1, item2);
  } else {
    return (bin(item1.coche) ? 1 : -1)
  }
}

function bin(value) {
  return (value == undefined ? false : value);
}

function compareItem(item1, item2) {
  return (sansAccent(item1.produit.toUpperCase()) > sansAccent(item2.produit.toUpperCase())) ? 1 : -1;
}

function compareCategory(item1, item2) {
  return (sansAccent(item1.category.toUpperCase()) > sansAccent(item2.category.toUpperCase())) ? 1 : -1;
}

// Event handlers for adding, updating and removing todos
async function addItem(produit) {
  const newItem = getShoppingListNewItem(produit);
  return await updateItem(newItem);
}

async function updateItem(item) {
  var result;
  if (item._id == undefined) {
    result = await db.post(item);
  } else {
    result = await db.put(item);
  }
  if (result.ok) {
    await updateList();
  }
}

async function removeItem(item) {
  const removal = await db.remove(item);
  if (removal.ok) {
    // For removal, we can just update the local state instead of reloading everything from PouchDB,
    // since we no longer care about the doc’s revision.
    var list = get(shoppingList)
    shoppingList.set(list.filter(oneItem => oneItem._id !== item._id));
  }
}

function getShoppingListItem(id) {
  var produit = get(shoppingList).filter(oneItem => oneItem._id == id);
  return produit[0];
}

function getShoppingListNewItem(produit = '', detail = '', coche = false, categoryId = '') {
  return {
    type: 'produit',
    produit: produit,
    coche: coche,
    detail: detail,
    categoryId: categoryId,
    ean: '',
    image_small_url: '',
    image_url: ''
  };
}

// Event handlers for adding, updating and removing categories
async function addCategory(category) {
  const newItem = getCategoryListNewItem(category);
  await updateCategory(newItem);
}

async function updateCategory(category) {
  var result;
  if (category._id == undefined) {
    result = await db.post(category);
  } else {
    result = await db.put(category);
  }
  if (result.ok) {
    await updateList();
  }
}

async function removeCategory(category) {
  const removal = await db.remove(category);
  if (removal.ok) {
    // For removal, we can just update the local state instead of reloading everything from PouchDB,
    // since we no longer care about the doc’s revision.
    var list = get(categoryList);
    categoryList.set(list.filter(oneItem => oneItem._id !== category._id));

    // Now, we remove the category Id of all related items
    for (const item of get(shoppingList)) {
      if (item.categoryId == category._id) {
        item.categoryId = '';
        await db.put(item);
      }
    }
    await updateList();
  }
}

function getCategoryListItem(id) {
  var category = get(categoryList).filter(oneItem => oneItem._id == id);
  return category[0];
}

function getCategoryListNewItem(category = '', detail = '') {
  return {
    type: 'category',
    category: category,
    detail: detail
  };
}

function createParams() {
  const { subscribe, set, update } = writable({});

  return {
    subscribe,
    readParams: () => update(params => readParams(params)),
    saveParams: () => update(params => saveParams(params)),
    set: (value) => set(value)
  };
}

function createLocal() {
  const { subscribe, set, update } = writable({});
  return {
    subscribe,
    setLocal: (lang) => update(local => setLocal(local, lang)),
    set: (value) => set(value)
  };
}