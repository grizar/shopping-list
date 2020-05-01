<script context="module">

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
                parameters: "Paramètres",
                all: 'Courses',
                cancel: 'Annuler',
                ok: 'OK',
                newItem: 'Nouvel achat ...',
                product: 'Produit',
                added: 'ajouté',

                // Parameters.svelte
                couchdbConf: 'Configuration Couchdb (http)',
                serverName: 'Nom du serveur',
                port: 'Port',
                databaseName: 'Nom de la base de données',

                portError: 'Port entre 1000 et 9999',
                min3chars: 'Minimum 3 caractères',
                
                parametersSaved: 'Paramètres sauvés !',
                parametersError: 'Paramètres incorrects non sauvés',
                
                displaySection : 'Affichage',
                showPurchasedAtTheEnd: 'Afficher les achats réalisés en fin de liste ?',
                allwaysShowDeleteButton: 'Toujours afficher le bouton de suppression ?',
                language: 'Langue'

            }
            break;
        case 'EN':
        default:
            loc = {
                // App.svelte
                parameters: "Parameters",
                all: 'Shopping',
                cancel: 'Cancel',
                ok: 'OK',
                newItem: 'New product ...',
                product: 'Product',
                added: 'added',

                // Parameters.svelte
                couchdbConf: 'Couchdb configuration (http)',
                serverName: 'Server name',
                port: 'Port',
                databaseName: 'Database name',

                portError: 'Port within 1000 and 9999',
                min3chars: 'Minimum 3 characters',

                parametersSaved: 'Parameters saved !',
                parametersError: 'Incorrect parameters. Not saved !',
                
                displaySection : 'Display',
                showPurchasedAtTheEnd: 'Display the purchases made at the end of the list?',
                allwaysShowDeleteButton: 'Always show delete button?',
                language: 'Language'
            }
            break;
    }
    local.set(loc);
  }

</script>