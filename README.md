# Postman Business Manager Cartridge

Una Business Manager cartridge completa per SFCC che integra un clone di Postman direttamente nel Business Manager con Lightning Design System, seguendo la [documentazione ufficiale SFCC](https://sfcclearning.com/infocenter/content/b2c_commerce/topics/site_development/b2c_customize_business_manager.php).

## 🚀 Funzionalità

- **🎨 Interfaccia Lightning Design System**: Stile nativo Salesforce per un'esperienza coerente
- **🔧 Test API completo**: Supporta tutti i metodi HTTP (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- **🏢 Gestione Workspaces**: Organizza le tue API in workspace separati per progetti diversi
- **📁 Gestione Collections**: Salva e organizza le tue richieste API in collezioni per workspace
- **🌍 Gestione Environments**: Gestisci variabili di ambiente per diversi contesti (dev, staging, prod)
- **📋 Headers personalizzati**: Aggiungi e gestisci headers HTTP personalizzati
- **📝 Body delle richieste**: Supporto per JSON, XML e altri formati
- **📊 Risposta dettagliata**: Visualizza status code, headers e body delle risposte
- **🔄 Sostituzione variabili**: Usa variabili di ambiente nelle URL e body (sintassi `{{variabile}}`)
- **💾 Persistenza dati**: Salvataggio automatico in Custom Objects SFCC
- **⌨️ Scorciatoie tastiera**: Ctrl+Enter per inviare richieste
- **📱 Design responsive**: Funziona su desktop e mobile

## 🚀 Installazione

### Opzione 1: Upload con Prophet (Raccomandato)

Se hai Prophet configurato:

1. **Apri Prophet** e connettiti al tuo sandbox SFCC
2. **Importa il progetto**:
   - File > Import > Existing Projects into Workspace
   - Seleziona la directory `bm_postman`
   - Il file `.project` sarà riconosciuto automaticamente
3. **Upload della cartridge**:
   - Clicca destro sul progetto `bm_postman`
   - Seleziona "Upload to Sandbox"
   - Prophet caricherà automaticamente tutti i file

### Opzione 2: Upload Manuale

1. Comprimi la cartridge in un file ZIP:
   ```bash
   cd bm_postman
   zip -r bm_postman.zip .
   ```

2. Carica la cartridge tramite Business Manager:
   - Accedi al Business Manager
   - Vai a Administration > Site Development > Code Deployment
   - Carica il file ZIP
   - Attiva la cartridge

### 2. Configurazione Site

1. Aggiungi la cartridge al path delle cartridge del tuo site:
   - Business Manager > Administration > Sites > Manage Sites
   - Seleziona il tuo site
   - Vai al tab "Settings"
   - Aggiungi `bm_postman` al "Cartridges Path" (all'inizio della lista)

### 3. Verifica Installazione

1. Accedi al Business Manager
2. Dovresti vedere nel menu: **Site Preferences > Postman**
3. Clicca per aprire l'interfaccia Postman

### 4. Configurazione Permessi (Opzionale)

Se necessario, puoi configurare i permessi per il menu action:
- Administration > Organization > Permissions
- Cerca "paypal-disputes" e assegna i permessi appropriati

## 🎯 Utilizzo

### Test di una API

1. **Seleziona il metodo HTTP** (GET, POST, PUT, etc.)
2. **Inserisci l'URL** dell'endpoint da testare
3. **Aggiungi headers** se necessari (es. Content-Type, Authorization)
4. **Inserisci il body** per richieste POST/PUT (JSON, XML, etc.)
5. **Clicca Send** o usa la scorciatoia **Ctrl+Enter**

### Gestione Collections

1. **Crea una nuova collection**:
   - Clicca "New Collection" nella sidebar sinistra
   - Inserisci nome e descrizione
   - Salva la collection

2. **Salva richieste nella collection**:
   - Configura la tua richiesta
   - Salva nella collection desiderata

### Gestione Environments

1. **Crea un nuovo environment**:
   - Clicca "New Environment" nella sidebar sinistra
   - Inserisci nome e descrizione
   - Aggiungi variabili (es. `baseUrl`: `https://api.example.com`)

2. **Usa le variabili**:
   - Nelle URL: `{{baseUrl}}/users`
   - Nei body: `{"apiKey": "{{apiKey}}"}`

### Esempi di Utilizzo

#### Gestione Workspaces
1. **Crea un Workspace**: Clicca su "New Workspace" per creare un nuovo progetto
2. **Seleziona Workspace**: Usa il dropdown per filtrare collections e environments
3. **Organizza per Progetto**: Ogni workspace può contenere le sue collections e environments

#### Test API REST
```
Method: GET
URL: https://api.example.com/users
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{token}}
```

#### Test con Environment Variables
```
Environment Variables:
  - baseUrl: https://api.example.com
  - token: your-api-token

URL: {{baseUrl}}/users
Headers:
  - Authorization: Bearer {{token}}
```

#### Organizzazione per Workspace
```
Workspace: "E-commerce API"
├── Collections:
│   ├── "User Management"
│   ├── "Product Catalog"
│   └── "Order Processing"
└── Environments:
    ├── "Development"
    ├── "Staging"
    └── "Production"

Workspace: "Payment Gateway"
├── Collections:
│   ├── "PayPal Integration"
│   └── "Stripe Integration"
└── Environments:
    ├── "Sandbox"
    └── "Live"
```

## 📁 Struttura

```
bm_postman/
├── cartridge/
│   ├── bm_extensions.xml          # Configurazione menu Business Manager
│   ├── controllers/
│   │   └── Postman.js             # Controller principale
│   ├── templates/default/
│   │   └── postman/
│   │       └── main.isml          # Template principale
│   ├── client/default/
│   │   ├── css/                   # CSS personalizzati
│   │   └── js/                    # JavaScript
│   └── static/default/
│       ├── css/                   # File CSS statici
│       └── js/                    # File JS statici
└── package.json                   # Configurazione package
```

## 🎯 Funzionalità Implementate

- ✅ **Interfaccia Postman completa** con Lightning Design System
- ✅ **Gestione HTTP requests** (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ **Sistema Workspaces** per organizzare progetti separati
- ✅ **Sistema Collections** per salvare e organizzare richieste per workspace
- ✅ **Gestione Environments** con variabili dinamiche per workspace
- ✅ **Headers personalizzati** con interfaccia intuitiva
- ✅ **Body delle richieste** con supporto JSON/XML
- ✅ **Visualizzazione Response** con syntax highlighting
- ✅ **Sostituzione variabili** nelle URL e body
- ✅ **Persistenza dati** in Custom Objects SFCC
- ✅ **Scorciatoie tastiera** (Ctrl+Enter per Send)
- ✅ **Design responsive** per desktop e mobile
- ✅ **Modals** per Collections e Environments
- ✅ **Gestione errori** con messaggi user-friendly
- ✅ **Loading states** e feedback visivo

## 🔄 Prossimi Sviluppi

- [ ] **Import/Export** di Collections e Environments
- [ ] **History** delle richieste precedenti
- [ ] **Pre-request Scripts** per automazione
- [ ] **Tests** automatici per validazione response
- [ ] **GraphQL** support
- [ ] **WebSocket** testing
- [ ] **OAuth 2.0** authentication helper
- [ ] **API Documentation** generator

## 🛠️ Sviluppo con Prophet

### Workflow di Sviluppo

1. **Modifica i file** nel progetto Prophet
2. **Upload incrementale**:
   - Clicca destro sul file modificato
   - Seleziona "Upload to Sandbox"
   - Solo il file modificato verrà caricato
3. **Upload completo** (se necessario):
   - Clicca destro sul progetto
   - Seleziona "Upload to Sandbox"

### File Principali da Modificare

- **Controller**: `cartridge/controllers/Postman.js`
- **Template**: `cartridge/templates/default/postman/main.isml`
- **Configurazione Menu**: `cartridge/bm_extensions.xml`
- **CSS**: `cartridge/client/default/css/` (da creare)
- **JavaScript**: `cartridge/client/default/js/` (da creare)

### Debug con Prophet

- Usa la console Prophet per vedere i log
- Controlla i log del Business Manager per errori
- Usa il debugger integrato di Prophet per JavaScript

## 🐛 Troubleshooting

### Menu non appare
- ✅ Verifica che `bm_postman` sia nel cartridge path (all'inizio della lista)
- ✅ Controlla che il file `bm_extensions.xml` sia presente in `/cartridge/`
- ✅ Verifica che la cartridge sia attivata in Code Deployment
- ✅ Ricarica la pagina del Business Manager (hard refresh: Ctrl+F5)
- ✅ Controlla i log per errori di sintassi XML
- ✅ **IMPORTANTE**: Il menu dovrebbe apparire sotto **Administration** (non come menu principale)
- ✅ Verifica che la cartridge sia stata caricata correttamente (controlla Code Deployment)
- ✅ Prova a fare logout/login dal Business Manager

### Errore 404 o Pipeline non trovata
- ✅ Verifica che il controller `Postman.js` sia presente in `/cartridge/controllers/`
- ✅ Controlla che il template `main.isml` sia in `/cartridge/templates/default/postman/`
- ✅ Verifica che la pipeline sia definita correttamente in `bm_extensions.xml`
- ✅ Controlla che il controller esporti correttamente `exports.Start = start`

### Errori di Permessi
- ✅ Vai a Administration > Organization > Permissions
- ✅ Cerca "postman-main" e assegna i permessi appropriati
- ✅ Verifica che l'utente abbia accesso al site

### Problemi con Prophet
- ✅ Verifica la connessione al sandbox in Prophet
- ✅ Controlla che il progetto sia stato importato correttamente
- ✅ Assicurati che l'upload sia completato senza errori
- ✅ Verifica che la cartridge sia attivata dopo l'upload

### Debug Steps - Menu Non Visibile

**Step 1: Verifica Upload Cartridge**
1. Vai a Administration > Site Development > Code Deployment
2. Controlla che `bm_postman` sia presente e **attivata** (stato "Active")
3. Se non è attiva, clicca su "Activate"

**Step 2: Verifica Cartridge Path**
1. Vai a Administration > Sites > Manage Sites
2. Seleziona il tuo site
3. Tab "Settings" > "Cartridges Path"
4. Verifica che `bm_postman` sia presente **all'inizio** della lista
5. Se non c'è, aggiungila e salva

**Step 3: Verifica File**
1. Controlla che il file `bm_extensions.xml` sia presente in `/cartridge/`
2. Verifica la sintassi XML (dovrebbe essere valida)
3. Controlla che il controller `Postman.js` sia presente

**Step 4: Refresh e Test**
1. Fai logout dal Business Manager
2. Fai login di nuovo
3. Cerca il menu sotto **Administration** (non come menu principale)
4. Se ancora non appare, controlla i log per errori

**Step 5: Test con Browser**
1. Prova con un browser diverso
2. Pulisci la cache del browser
3. Fai hard refresh (Ctrl+F5)

---

**Cartridge creata seguendo la documentazione ufficiale SFCC! 🎉**

**Riferimento**: [SFCC Business Manager Customization Documentation](https://sfcclearning.com/infocenter/content/b2c_commerce/topics/site_development/b2c_customize_business_manager.php)