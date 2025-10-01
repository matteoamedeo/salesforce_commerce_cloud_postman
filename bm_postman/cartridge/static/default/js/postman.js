/******/ (function() { // webpackBootstrap
/*!**********************************************************************!*\
  !*** ./cartridges/bm_postman/cartridge/client/default/js/postman.js ***!
  \**********************************************************************/
/**
 * Postman API Tester - JavaScript functionality
 */

class PostmanApp {
  constructor() {
    this.currentCollection = null;
    this.currentEnvironment = null;
    this.currentWorkspace = null;
    this.collections = [];
    this.environments = [];
    this.workspaces = [];
    this.isLoading = false;
    this.urls = document.querySelector('.js-postman-dataset');
    this.svgs = document.querySelector('.js-postman-svg-dataset');
    this.init();
  }
  init() {
    this.bindEvents();
    this.loadWorkspaces();
    this.loadCollections();
    this.loadEnvironments();
    this.setupDefaultRequest();
  }
  bindEvents() {
    // Send request button
    document.getElementById('send-request-btn').addEventListener('click', () => {
      this.sendRequest();
    });

    // New collection button
    document.getElementById('new-collection-btn').addEventListener('click', () => {
      this.showCollectionModal();
    });

    // New environment button
    document.getElementById('new-environment-btn').addEventListener('click', () => {
      this.showEnvironmentModal();
    });

    // New workspace button
    document.getElementById('new-workspace-btn').addEventListener('click', () => {
      this.showWorkspaceModal();
    });

    // Workspace selector
    document.getElementById('workspace-select').addEventListener('change', e => {
      this.selectWorkspace(e.target.value);
    });

    // Add header button
    document.getElementById('add-header-btn').addEventListener('click', () => {
      this.addHeaderRow();
    });

    // Add environment variable button
    document.getElementById('add-environment-variable').addEventListener('click', () => {
      this.addEnvironmentVariableRow();
    });

    // Collection modal events
    document.getElementById('close-collection-modal').addEventListener('click', () => {
      this.hideCollectionModal();
    });
    document.getElementById('cancel-collection').addEventListener('click', () => {
      this.hideCollectionModal();
    });
    document.getElementById('save-collection').addEventListener('click', () => {
      this.saveCollection();
    });

    // Environment modal events
    document.getElementById('close-environment-modal').addEventListener('click', () => {
      this.hideEnvironmentModal();
    });
    document.getElementById('cancel-environment').addEventListener('click', () => {
      this.hideEnvironmentModal();
    });
    document.getElementById('save-environment').addEventListener('click', () => {
      this.saveEnvironment();
    });

    // Workspace modal events
    document.getElementById('close-workspace-modal').addEventListener('click', () => {
      this.hideWorkspaceModal();
    });
    document.getElementById('cancel-workspace').addEventListener('click', () => {
      this.hideWorkspaceModal();
    });
    document.getElementById('save-workspace').addEventListener('click', () => {
      this.saveWorkspace();
    });

    // Backdrop clicks
    document.getElementById('collection-backdrop').addEventListener('click', () => {
      this.hideCollectionModal();
    });
    document.getElementById('environment-backdrop').addEventListener('click', () => {
      this.hideEnvironmentModal();
    });
    document.getElementById('workspace-backdrop').addEventListener('click', () => {
      this.hideWorkspaceModal();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.sendRequest();
      }
    });
  }
  setupDefaultRequest() {
    // Set default URL
    document.getElementById('request-url').value = 'https://api.example.com/endpoint';

    // Add default headers
    this.addHeaderRow();
    const headerInputs = document.querySelectorAll('#headers-container .slds-input');
    if (headerInputs.length >= 2) {
      headerInputs[0].value = 'Content-Type';
      headerInputs[1].value = 'application/json';
    }
  }
  async sendRequest() {
    if (this.isLoading) return;
    const method = document.getElementById('request-method').value;
    const url = document.getElementById('request-url').value;
    const body = document.getElementById('request-body').value;
    if (!url.trim()) {
      this.showError('Please enter a URL');
      return;
    }
    this.setLoading(true);
    this.clearResponse();
    try {
      // Collect headers
      const headers = this.collectHeaders();

      // Prepare request data
      const requestData = {
        method: method,
        url: url,
        headers: headers,
        body: body,
        environment: this.currentEnvironment ? this.currentEnvironment.variables : {}
      };

      // Send request
      const response = await fetch('/on/demandware.store/Sites-Site/default/Postman-ExecuteRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestData: JSON.stringify(requestData)
        })
      });
      const result = await response.json();
      this.displayResponse(result);
    } catch (error) {
      this.showError('Request failed: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  collectHeaders() {
    const headers = [];
    const headerRows = document.querySelectorAll('#headers-container .slds-grid');
    headerRows.forEach(row => {
      const inputs = row.querySelectorAll('.slds-input');
      if (inputs.length >= 2 && inputs[0].value.trim() && inputs[1].value.trim()) {
        headers.push({
          key: inputs[0].value.trim(),
          value: inputs[1].value.trim()
        });
      }
    });
    return headers;
  }
  displayResponse(result) {
    const statusElement = document.getElementById('response-status');
    const timeElement = document.getElementById('response-time');
    const headersElement = document.getElementById('response-headers');
    const bodyElement = document.getElementById('response-body');

    // Update status
    statusElement.textContent = result.statusCode || 'Error';
    statusElement.className = 'slds-badge';
    if (result.success) {
      statusElement.classList.add('success');
    } else if (result.statusCode >= 400) {
      statusElement.classList.add('error');
    } else if (result.statusCode >= 300) {
      statusElement.classList.add('warning');
    }

    // Update response time
    timeElement.textContent = result.responseTime + 'ms';

    // Update headers
    if (result.headers) {
      let headersHtml = '';
      for (const [key, value] of Object.entries(result.headers)) {
        headersHtml += `<div><strong>${key}:</strong> ${value}</div>`;
      }
      headersElement.innerHTML = headersHtml || '<div>No headers</div>';
    } else {
      headersElement.innerHTML = '<div>No headers</div>';
    }

    // Update body
    if (result.data) {
      try {
        // Try to format as JSON
        const jsonData = JSON.parse(result.data);
        bodyElement.innerHTML = `<code>${JSON.stringify(jsonData, null, 2)}</code>`;
      } catch (e) {
        // Not JSON, display as plain text
        bodyElement.innerHTML = `<code>${this.escapeHtml(result.data)}</code>`;
      }
    } else if (result.error) {
      bodyElement.innerHTML = `<code style="color: #ea001e;">${this.escapeHtml(result.error)}</code>`;
    } else {
      bodyElement.innerHTML = '<code>No response body</code>';
    }
  }
  clearResponse() {
    document.getElementById('response-status').textContent = 'Ready';
    document.getElementById('response-status').className = 'slds-badge';
    document.getElementById('response-time').textContent = '0ms';
    document.getElementById('response-headers').innerHTML = '';
    document.getElementById('response-body').innerHTML = '<code>No response yet. Send a request to see the response here.</code>';
  }
  setLoading(loading) {
    this.isLoading = loading;
    const sendBtn = document.getElementById('send-request-btn');
    if (loading) {
      sendBtn.disabled = true;
      sendBtn.innerHTML = `<svg class="slds-button__icon slds-button__icon--left" aria-hidden="true"><use xlink:href="${this.svgs.dataset.spinner}"></use></svg>Sending...`;
    } else {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `<svg class="slds-button__icon slds-button__icon--left" aria-hidden="true"><use xlink:href="${this.svgs.dataset.send}"></use></svg>Send`;
    }
  }
  addHeaderRow() {
    const container = document.getElementById('headers-container');
    const row = document.createElement('div');
    row.className = 'slds-grid slds-gutters slds-m-bottom--small';
    row.innerHTML = `
            <div class="slds-col slds-size--1-of-2">
                <input type="text" class="slds-input" placeholder="Header Name" />
            </div>
            <div class="slds-col slds-size--1-of-2">
                <input type="text" class="slds-input" placeholder="Header Value" />
            </div>
        `;
    container.appendChild(row);
  }
  addEnvironmentVariableRow() {
    const container = document.getElementById('environment-variables');
    const row = document.createElement('div');
    row.className = 'slds-grid slds-gutters slds-m-bottom--small';
    row.innerHTML = `
            <div class="slds-col slds-size--1-of-2">
                <input type="text" class="slds-input" placeholder="Variable Name" />
            </div>
            <div class="slds-col slds-size--1-of-2">
                <input type="text" class="slds-input" placeholder="Variable Value" />
            </div>
        `;
    container.appendChild(row);
  }
  async loadWorkspaces() {
    try {
      let url = this.urls.dataset.listWorkspaces;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        this.workspaces = result.data || [];
        this.renderWorkspaces();
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  }
  async loadCollections() {
    try {
      const workspaceId = this.currentWorkspace || '';
      var listCollectionsUrl = this.urls.dataset.listCollections;
      const url = workspaceId ? `${listCollectionsUrl}?workspaceId=${workspaceId}` : listCollectionsUrl;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        this.collections = result.data || [];
        this.renderCollections();
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }
  renderCollections() {
    const container = document.getElementById('collections-list');
    const countElement = document.getElementById('collections-count');
    countElement.textContent = this.collections.length;
    if (this.collections.length === 0) {
      container.innerHTML = '<div class="slds-text-body--small slds-text-color--weak">No collections yet</div>';
      return;
    }
    container.innerHTML = this.collections.map(collection => `
            <div class="collection-item" data-collection-id="${collection.id}">
                <div>
                    <svg class="slds-icon slds-icon--x-small" aria-hidden="true">
                        <use xlink:href="${this.svgs.dataset.collection}"></use>
                    </svg>
                    <span>${this.escapeHtml(collection.name)}</span>
                </div>
                <div class="action-buttons">
                    <button class="slds-button slds-button--icon" title="Load Collection" onclick="postmanApp.loadCollection('${collection.id}')">
                        <svg class="slds-button__icon" aria-hidden="true">
                            <use xlink:href="${this.svgs.dataset.add}"></use>
                        </svg>
                    </button>
                    <button class="slds-button slds-button--icon" title="Delete Collection" onclick="postmanApp.deleteCollection('${collection.id}')">
                        <svg class="slds-button__icon" aria-hidden="true">
                            <use xlink:href="${this.svgs.dataset.delete}"></use>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
  }
  renderWorkspaces() {
    const container = document.getElementById('workspaces-list');
    const countElement = document.getElementById('workspaces-count');
    const selectElement = document.getElementById('workspace-select');
    let lastUsed = false;
    countElement.textContent = this.workspaces.length;

    // Update workspace selector
    this.workspaces.forEach(workspace => {
      const option = document.createElement('option');
      option.value = workspace.id;
      option.textContent = workspace.name;
      selectElement.appendChild(option);
      if (workspace.lastUsed == true) {
        lastUsed = workspace.id;
      }
    });
    if (this.workspaces.length === 0) {
      container.innerHTML = '<div class="slds-text-body--small slds-text-color--weak">No workspaces yet</div>';
      return;
    }
    if (lastUsed) {
      this.selectWorkspace(lastUsed);
      document.getElementById('workspace-select').value = lastUsed;
    } else {
      selectElement.innerHTML = '<option value="">All Workspaces</option>';
    }
  }
  async selectWorkspace(workspaceId) {
    this.currentWorkspace = workspaceId || null;
    let url = this.urls.dataset.selectWorkspace + '?workspaceId=' + this.currentWorkspace;
    const response = await fetch(url);
    const result = await response.json();
    if (result.success) {
      this.loadCollections();
      this.loadEnvironments();
    }
  }
  async loadEnvironments() {
    try {
      const workspaceId = this.currentWorkspace || '';
      let listEnvUrl = this.urls.dataset.listEnvironments;
      const url = workspaceId ? `${listEnvUrl}?workspaceId=${workspaceId}` : listEnvUrl;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        this.environments = result.data || [];
        this.renderEnvironments();
      }
    } catch (error) {
      console.error('Error loading environments:', error);
    }
  }
  renderEnvironments() {
    const container = document.getElementById('environments-list');
    const countElement = document.getElementById('environments-count');
    countElement.textContent = this.environments.length;
    if (this.environments.length === 0) {
      container.innerHTML = '<div class="slds-text-body--small slds-text-color--weak">No environments yet</div>';
      return;
    }
    container.innerHTML = this.environments.map(environment => `
            <div class="environment-item" data-environment-id="${environment.id}">
                <div>
                    <svg class="slds-icon slds-icon--x-small" aria-hidden="true">
                        <use xlink:href="${this.svgs.dataset.environment}"></use>
                    </svg>
                    <span>${this.escapeHtml(environment.name)}</span>
                </div>
                <div class="action-buttons">
                    <button class="slds-button slds-button--icon" title="Load Environment" onclick="postmanApp.loadEnvironment('${environment.id}')">
                        <svg class="slds-button__icon" aria-hidden="true">
                            <use xlink:href="${this.svgs.dataset.download}"></use>
                        </svg>
                    </button>
                    <button class="slds-button slds-button--icon" title="Delete Environment" onclick="postmanApp.deleteEnvironment('${environment.id}')">
                        <svg class="slds-button__icon" aria-hidden="true">
                            <use xlink:href="${this.svgs.dataset.delete}"></use>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
  }
  showCollectionModal() {
    let collection = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const modal = document.getElementById('collection-modal');
    const backdrop = document.getElementById('collection-backdrop');
    const title = document.getElementById('collection-modal-title');
    const nameInput = document.getElementById('collection-name');
    const descInput = document.getElementById('collection-description');
    if (collection) {
      title.textContent = 'Edit Collection';
      nameInput.value = collection.name || '';
      descInput.value = collection.description || '';
    } else {
      title.textContent = 'New Collection';
      nameInput.value = '';
      descInput.value = '';
    }
    modal.style.display = 'block';
    backdrop.style.display = 'block';

    // Store current collection for editing
    this.editingCollection = collection;
  }
  hideCollectionModal() {
    document.getElementById('collection-modal').style.display = 'none';
    document.getElementById('collection-backdrop').style.display = 'none';
    this.editingCollection = null;
  }
  showEnvironmentModal() {
    let environment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const modal = document.getElementById('environment-modal');
    const backdrop = document.getElementById('environment-backdrop');
    const title = document.getElementById('environment-modal-title');
    const nameInput = document.getElementById('environment-name');
    const descInput = document.getElementById('environment-description');
    const variablesContainer = document.getElementById('environment-variables');
    if (environment) {
      title.textContent = 'Edit Environment';
      nameInput.value = environment.name || '';
      descInput.value = environment.description || '';

      // Clear existing variables
      variablesContainer.innerHTML = '';

      // Add existing variables
      if (environment.variables) {
        for (const [key, value] of Object.entries(environment.variables)) {
          this.addEnvironmentVariableRow();
          const rows = variablesContainer.querySelectorAll('.slds-grid');
          const lastRow = rows[rows.length - 1];
          const inputs = lastRow.querySelectorAll('.slds-input');
          inputs[0].value = key;
          inputs[1].value = value;
        }
      }
    } else {
      title.textContent = 'New Environment';
      nameInput.value = '';
      descInput.value = '';
      variablesContainer.innerHTML = '';
      this.addEnvironmentVariableRow();
    }
    modal.style.display = 'block';
    backdrop.style.display = 'block';

    // Store current environment for editing
    this.editingEnvironment = environment;
  }
  hideEnvironmentModal() {
    document.getElementById('environment-modal').style.display = 'none';
    document.getElementById('environment-backdrop').style.display = 'none';
    this.editingEnvironment = null;
  }
  showWorkspaceModal() {
    let workspace = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    const modal = document.getElementById('workspace-modal');
    const backdrop = document.getElementById('workspace-backdrop');
    const title = document.getElementById('workspace-modal-title');
    const nameInput = document.getElementById('workspace-name');
    const descInput = document.getElementById('workspace-description');
    if (workspace) {
      title.textContent = 'Edit Workspace';
      nameInput.value = workspace.name || '';
      descInput.value = workspace.description || '';
    } else {
      title.textContent = 'New Workspace';
      nameInput.value = '';
      descInput.value = '';
    }
    modal.style.display = 'block';
    backdrop.style.display = 'block';

    // Store current workspace for editing
    this.editingWorkspace = workspace;
  }
  hideWorkspaceModal() {
    document.getElementById('workspace-modal').style.display = 'none';
    document.getElementById('workspace-backdrop').style.display = 'none';
    this.editingWorkspace = null;
  }
  async saveCollection() {
    const name = document.getElementById('collection-name').value.trim();
    const description = document.getElementById('collection-description').value.trim();
    if (!name) {
      this.showError('Please enter a collection name');
      return;
    }
    try {
      const collectionData = {
        id: this.editingCollection ? this.editingCollection.id : null,
        name: name,
        description: description,
        workspaceId: this.currentWorkspace,
        requests: this.editingCollection ? this.editingCollection.requests : []
      };
      let url = this.urls.dataset.saveCollection;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectionData: JSON.stringify(collectionData)
        })
      });
      const result = await response.json();
      if (result.success) {
        this.hideCollectionModal();
        this.loadCollections();
        this.showSuccess('Collection saved successfully');
      } else {
        this.showError(result.message || 'Failed to save collection');
      }
    } catch (error) {
      this.showError('Error saving collection: ' + error.message);
    }
  }
  async saveEnvironment() {
    const name = document.getElementById('environment-name').value.trim();
    const description = document.getElementById('environment-description').value.trim();
    if (!name) {
      this.showError('Please enter an environment name');
      return;
    }
    try {
      // Collect variables
      const variables = {};
      const variableRows = document.querySelectorAll('#environment-variables .slds-grid');
      variableRows.forEach(row => {
        const inputs = row.querySelectorAll('.slds-input');
        if (inputs.length >= 2 && inputs[0].value.trim() && inputs[1].value.trim()) {
          variables[inputs[0].value.trim()] = inputs[1].value.trim();
        }
      });
      const environmentData = {
        id: this.editingEnvironment ? this.editingEnvironment.id : null,
        name: name,
        description: description,
        workspaceId: this.currentWorkspace,
        variables: variables
      };
      var url = this.urls.dataset.saveEnvironment;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          environmentData: JSON.stringify(environmentData)
        })
      });
      const result = await response.json();
      if (result.success) {
        this.hideEnvironmentModal();
        this.loadEnvironments();
        this.showSuccess('Environment saved successfully');
      } else {
        this.showError(result.message || 'Failed to save environment');
      }
    } catch (error) {
      this.showError('Error saving environment: ' + error.message);
    }
  }
  async loadCollection(collectionId) {
    try {
      const response = await fetch(`/on/demandware.store/Sites-Site/default/Postman-LoadCollection?collectionId=${collectionId}`);
      const result = await response.json();
      if (result.success && result.data) {
        this.currentCollection = result.data;
        this.showSuccess('Collection loaded successfully');
        // Here you could populate the request form with collection data
      } else {
        this.showError('Failed to load collection');
      }
    } catch (error) {
      this.showError('Error loading collection: ' + error.message);
    }
  }
  async loadEnvironment(environmentId) {
    try {
      const response = await fetch(`/on/demandware.store/Sites-Site/default/Postman-LoadEnvironment?environmentId=${environmentId}`);
      const result = await response.json();
      if (result.success && result.data) {
        this.currentEnvironment = result.data;
        this.showSuccess('Environment loaded successfully');
      } else {
        this.showError('Failed to load environment');
      }
    } catch (error) {
      this.showError('Error loading environment: ' + error.message);
    }
  }
  async deleteCollection(collectionId) {
    if (!confirm('Are you sure you want to delete this collection?')) {
      return;
    }
    try {
      const response = await fetch('/on/demandware.store/Sites-Site/default/Postman-DeleteCollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          collectionId: collectionId
        })
      });
      const result = await response.json();
      if (result.success) {
        this.loadCollections();
        this.showSuccess('Collection deleted successfully');
      } else {
        this.showError(result.message || 'Failed to delete collection');
      }
    } catch (error) {
      this.showError('Error deleting collection: ' + error.message);
    }
  }
  async deleteEnvironment(environmentId) {
    if (!confirm('Are you sure you want to delete this environment?')) {
      return;
    }
    try {
      const response = await fetch('/on/demandware.store/Sites-Site/default/Postman-DeleteEnvironment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          environmentId: environmentId
        })
      });
      const result = await response.json();
      if (result.success) {
        this.loadEnvironments();
        this.showSuccess('Environment deleted successfully');
      } else {
        this.showError(result.message || 'Failed to delete environment');
      }
    } catch (error) {
      this.showError('Error deleting environment: ' + error.message);
    }
  }
  async saveWorkspace() {
    const name = document.getElementById('workspace-name').value.trim();
    const description = document.getElementById('workspace-description').value.trim();
    if (!name) {
      this.showError('Please enter a workspace name');
      return;
    }
    try {
      const workspaceData = {
        id: this.editingWorkspace ? this.editingWorkspace.id : null,
        name: name,
        description: description
      };
      let url = this.urls.dataset.saveWorkspace;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspaceData: JSON.stringify(workspaceData)
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        this.hideWorkspaceModal();
        this.loadWorkspaces();
        this.showSuccess('Workspace saved successfully');
      } else {
        this.showError(result.message || 'Failed to save workspace');
      }
    } catch (error) {
      this.showError('Error saving workspace: ' + error.message);
    }
  }
  async deleteWorkspace(workspaceId) {
    if (!confirm('Are you sure you want to delete this workspace? This will also delete all collections and environments in this workspace.')) {
      return;
    }
    try {
      const response = await fetch('/on/demandware.store/Sites-Site/default/Postman-DeleteWorkspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspaceId: workspaceId
        })
      });
      const result = await response.json();
      if (result.success) {
        this.loadWorkspaces();
        this.loadCollections();
        this.loadEnvironments();
        this.showSuccess('Workspace deleted successfully');
      } else {
        this.showError(result.message || 'Failed to delete workspace');
      }
    } catch (error) {
      this.showError('Error deleting workspace: ' + error.message);
    }
  }
  showError(message) {
    // Create a temporary error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'slds-notify slds-notify--alert slds-theme--error slds-m-bottom--medium';
    errorDiv.innerHTML = `
            <span class="slds-assistive-text">Error</span>
            <h2>${this.escapeHtml(message)}</h2>
        `;

    // Insert at the top of the main content
    const mainContent = document.querySelector('.slds-grid.slds-wrap');
    mainContent.insertBefore(errorDiv, mainContent.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
  showSuccess(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'slds-notify slds-notify--alert slds-theme--success slds-m-bottom--medium';
    successDiv.innerHTML = `
            <span class="slds-assistive-text">Success</span>
            <span class="slds-icon_container slds-icon-utility-success slds-m-right--x-small">
                <svg class="slds-icon slds-icon--x-small" aria-hidden="true">
                    <use xlink:href="${this.svgs.dataset.success}"></use>
                </svg>
            </span>
            <h2>${this.escapeHtml(message)}</h2>
        `;

    // Insert at the top of the main content
    const mainContent = document.querySelector('.slds-grid.slds-wrap');
    mainContent.insertBefore(successDiv, mainContent.firstChild);

    // Remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.postmanApp = new PostmanApp();
});
/******/ })()
;
//# sourceMappingURL=postman.js.map