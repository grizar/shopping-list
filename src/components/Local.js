  import { writable } from "svelte/store";

  const defaultLang = window.navigator.language.slice(0, 2).toUpperCase();

  const locLanguages = writable([{value: 'auto', text: 'Auto'},{value: 'FR', text: 'Français'},{value: 'EN', text: 'English'}]);
  export { locLanguages };

  const locParameters = writable('');
  export { locParameters };

  const local = writable({});
  export { local };

  setLocal('auto');
  // setLocal('EN');

   export function setLocal(lang) {
    
    var selectedLanguage = ( lang == 'auto' ) ? defaultLang : lang;

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

                portError: 'Port entre 1000 et 9999',
                min3chars: 'Minimum 3 caractères',
                
                parametersSaved: 'Paramètres sauvés !',
                parametersError: 'Paramètres incorrects non sauvés',
                
                displaySection : 'Affichage & comportement',
                showPurchasedAtTheEnd: 'Afficher les achats réalisés en fin de liste ?',
                allwaysShowDeleteButton: 'Toujours afficher le bouton de suppression ?',
                showEmptyCategory: 'Afficher la catégorie vide ?',
                longPressToEdit: 'Appui long pour éditer ?',
                language: 'Langue',

                creditSection: 'Crédits'

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

                portError: 'Port within 1000 and 9999',
                min3chars: 'Minimum 3 characters',

                parametersSaved: 'Parameters saved !',
                parametersError: 'Incorrect parameters. Not saved !',
                
                displaySection : 'Display & behaviour',
                showPurchasedAtTheEnd: 'Display the purchases made at the end of the list?',
                allwaysShowDeleteButton: 'Always show delete button?',
                showEmptyCategory: 'Display empty category?',
                longPressToEdit: 'Long press to edit ?',
                language: 'Language',

                creditSection: 'Credits'

            }
            break;
    }
    local.set(loc);
  }
