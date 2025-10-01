'use strict';

var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var HTTPClient = require('dw/net/HTTPClient');
var URLUtils = require('dw/web/URLUtils');

var log = Logger.getLogger('PostmanService', 'postman');

/**
 * PostmanService - Main service for handling API requests and collections
 */
var PostmanService = {
    /**
     * Workspaces CRUD
     */
    getWorkspaces: function () {
        var workspaces = [];
        var coIter = CustomObjectMgr.getAllCustomObjects('PostmanWorkspace');
        try {
            while (coIter.hasNext()) {
                var co = coIter.next();
                workspaces.push({
                    id: co.custom.ID,
                    name: co.custom.Name,
                    description: co.custom.Description || '',
                    createdAt: co.custom.CreatedDate,
                    updatedAt: co.custom.LastModifiedDate,
                    lastUsed: co.custom.LastUsed
                });
            }

        } catch (error) {
            var e = error;
            var debug = '';
        }
        return workspaces;
    },
    saveWorkspace: function (workspaceData) {
        var result = { success: false, message: '', workspaceId: null };
        try {
            Transaction.wrap(function () {
                var id = workspaceData.id || ('workspace_' + new Date().getTime());
                var co = CustomObjectMgr.getCustomObject('PostmanWorkspace', id) || CustomObjectMgr.createCustomObject('PostmanWorkspace', id);
                co.custom.Name = workspaceData.name;
                co.custom.Description = workspaceData.description || '';
                co.custom.CreatedDate = new Date();
                // if (!workspaceData.id) co.custom.createdAt = new Date();
                result.workspaceId = id;
                result.success = true;
                result.message = 'Workspace saved successfully';
            });
        } catch (e) {
            result.message = 'Error saving workspace: ' + e.message;
            log.error(result.message);
        }
        return result;
    },
    deleteWorkspace: function (workspaceId) {
        var result = { success: false, message: '' };
        try {
            Transaction.wrap(function () {
                var co = CustomObjectMgr.getCustomObject('PostmanWorkspace', workspaceId);
                if (co) {
                    CustomObjectMgr.remove(co);
                    result.success = true;
                    result.message = 'Workspace deleted successfully';
                } else {
                    result.message = 'Workspace not found';
                }
            });
        } catch (e) {
            result.message = 'Error deleting workspace: ' + e.message;
            log.error(result.message);
        }
        return result;
    },
    selectWorkspace: function (workspaceId) {
        var result = { success: true, message: 'Workspace selected successfully' };

        var coIter = CustomObjectMgr.getAllCustomObjects('PostmanWorkspace');
        try {
            while (coIter.hasNext()) {
                Transaction.wrap(function () {
                    var co = coIter.next();
                    if (co) {
                        if (co.custom.ID == workspaceId) {
                            co.custom.LastUsed == true;
                        } else {
                            co.custom.LastUsed == false;
                        }
                    } else {
                        result.message = 'Workspace not found';
                        result.success = false;
                    }
                });
            }
        } catch (error) {
            result.message = 'Error deleting workspace: ' + e.message;
            result.success = false;
            log.error(result.message);
        }

        return result;
    },

    /**
     * Execute HTTP request
     * @param {Object} requestData - Request configuration
     * @returns {Object} Response data
     */
    executeRequest: function (requestData) {
        var startTime = new Date().getTime();
        var httpClient = new HTTPClient();
        var result = {
            success: false,
            data: null,
            error: null,
            responseTime: 0,
            statusCode: 0,
            headers: {}
        };

        try {
            // Set request method
            httpClient.setRequestMethod(requestData.method || 'GET');

            // Set URL
            var url = this.replaceVariables(requestData.url, requestData.environment);
            httpClient.open(url);

            // Set headers
            if (requestData.headers && requestData.headers.length > 0) {
                requestData.headers.forEach(function (header) {
                    if (header.key && header.value) {
                        httpClient.setRequestHeader(header.key, header.value);
                    }
                });
            }

            // Set body for POST/PUT/PATCH requests
            if (['POST', 'PUT', 'PATCH'].indexOf(requestData.method) !== -1 && requestData.body) {
                httpClient.send(requestData.body);
            } else {
                httpClient.send();
            }

            var endTime = new Date().getTime();
            result.responseTime = endTime - startTime;
            result.statusCode = httpClient.getStatusCode();
            result.success = httpClient.getStatusCode() >= 200 && httpClient.getStatusCode() < 300;

            // Get response headers
            var responseHeaders = httpClient.getResponseHeaders();
            for (var header in responseHeaders) {
                if (responseHeaders.hasOwnProperty(header)) {
                    result.headers[header] = responseHeaders[header];
                }
            }

            // Get response text
            result.data = httpClient.getText();

            log.info('Request executed successfully: ' + url + ' - Status: ' + result.statusCode);

        } catch (e) {
            result.error = e.message;
            log.error('Error executing request: ' + e.message);
        }

        return result;
    },

    /**
     * Replace variables in URL and body
     * @param {string} text - Text containing variables
     * @param {Object} environment - Environment variables
     * @returns {string} Text with variables replaced
     */
    replaceVariables: function (text, environment) {
        if (!text || !environment) {
            return text;
        }

        var result = text;
        for (var key in environment) {
            if (environment.hasOwnProperty(key)) {
                var regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
                result = result.replace(regex, environment[key]);
            }
        }

        return result;
    },

    /**
     * Get all collections
     * @returns {Array} Array of collections
     */
    getCollections: function (workspaceId) {
        var collections = [];
        var customObjects = CustomObjectMgr.getAllCustomObjects('PostmanCollection');

        while (customObjects.hasNext()) {
            var customObject = customObjects.next();
            if (workspaceId && customObject.custom.WorkspaceID !== workspaceId) {
                continue;
            }
            collections.push({
                id: customObject.custom.ID,
                name: customObject.custom.Name,
                description: customObject.custom.Description,
                requests: customObject.custom.Requests,
                workspaceId: customObject.custom.WorkspaceID || null,
                createdAt: customObject.custom.CreatedDate,
                updatedAt: customObject.custom.LastModifiedDate
            });
        }

        return collections;
    },

    /**
     * Save collection
     * @param {Object} collectionData - Collection data
     * @returns {Object} Result object
     */
    saveCollection: function (collectionData) {
        var result = {
            success: false,
            message: '',
            collectionId: null
        };

        try {
            Transaction.wrap(function () {
                var customObject;
                var collectionId = collectionData.id || 'collection_' + new Date().getTime();

                if (CustomObjectMgr.getCustomObject('PostmanCollection', collectionId)) {
                    customObject = CustomObjectMgr.getCustomObject('PostmanCollection', collectionId);
                } else {
                    customObject = CustomObjectMgr.createCustomObject('PostmanCollection', collectionId);
                }

                customObject.custom.Name = collectionData.name;
                customObject.custom.Description = collectionData.description || '';
                customObject.custom.Requests = JSON.stringify(collectionData.requests || []);
                customObject.custom.WorkspaceID = collectionData.workspaceId || null;
                customObject.custom.LastModifiedDate = new Date();

                if (!collectionData.id) {
                    customObject.custom.CreatedDate = new Date();
                }

                result.collectionId = collectionId;
                result.success = true;
                result.message = 'Collection saved successfully';
            });

        } catch (e) {
            result.message = 'Error saving collection: ' + e.message;
            log.error('Error saving collection: ' + e.message);
        }

        return result;
    },

    /**
     * Load collection
     * @param {string} collectionId - Collection ID
     * @returns {Object|null} Collection data
     */
    loadCollection: function (collectionId) {
        try {
            var customObject = CustomObjectMgr.getCustomObject('PostmanCollection', collectionId);
            if (customObject) {
                return {
                    id: customObject.custom.ID,
                    name: customObject.custom.Name,
                    description: customObject.custom.Description,
                    workspaceId: customObject.custom.WorkspaceID || null,
                    requests: JSON.parse(customObject.custom.Requests || '[]'),
                    createdAt: customObject.custom.CreatedDate,
                    updatedAt: customObject.custom.LastModifiedDate
                };
            }
        } catch (e) {
            log.error('Error loading collection: ' + e.message);
        }

        return null;
    },

    /**
     * Delete collection
     * @param {string} collectionId - Collection ID
     * @returns {Object} Result object
     */
    deleteCollection: function (collectionId) {
        var result = {
            success: false,
            message: ''
        };

        try {
            Transaction.wrap(function () {
                var customObject = CustomObjectMgr.getCustomObject('PostmanCollection', collectionId);
                if (customObject) {
                    CustomObjectMgr.remove(customObject);
                    result.success = true;
                    result.message = 'Collection deleted successfully';
                } else {
                    result.message = 'Collection not found';
                }
            });

        } catch (e) {
            result.message = 'Error deleting collection: ' + e.message;
            log.error('Error deleting collection: ' + e.message);
        }

        return result;
    },

    /**
     * Get all environments
     * @returns {Array} Array of environments
     */
    getEnvironments: function (workspaceId) {
        var environments = [];
        var customObjects = CustomObjectMgr.getAllCustomObjects('PostmanEnvironment');

        while (customObjects.hasNext()) {
            var customObject = customObjects.next();
            if (workspaceId && customObject.custom.workspaceId !== workspaceId) {
                continue;
            }
            environments.push({
                id: customObject.custom.ID,
                name: customObject.custom.Name,
                description: customObject.custom.Description,
                workspaceId: customObject.custom.WorkspaceID || null,
                variables: JSON.parse(customObject.custom.Variables || '{}'),
                createdAt: customObject.custom.CreatedDate,
                updatedAt: customObject.custom.LastModifiedDate
            });
        }

        return environments;
    },

    /**
     * Save environment
     * @param {Object} environmentData - Environment data
     * @returns {Object} Result object
     */
    saveEnvironment: function (environmentData) {
        var result = {
            success: false,
            message: '',
            environmentId: null
        };

        try {
            Transaction.wrap(function () {
                var customObject;
                var environmentId = environmentData.id || 'environment_' + new Date().getTime();

                if (CustomObjectMgr.getCustomObject('PostmanEnvironment', environmentId)) {
                    customObject = CustomObjectMgr.getCustomObject('PostmanEnvironment', environmentId);
                } else {
                    customObject = CustomObjectMgr.createCustomObject('PostmanEnvironment', environmentId);
                }

                customObject.custom.Name = environmentData.name;
                customObject.custom.Description = environmentData.description || '';
                customObject.custom.Variables = JSON.stringify(environmentData.variables || {});
                customObject.custom.WorkspaceID = environmentData.workspaceId || null;
                customObject.custom.LastModifiedDate = new Date();

                if (!environmentData.id) {
                    customObject.custom.CreatedDate = new Date();
                }

                result.environmentId = environmentId;
                result.success = true;
                result.message = 'Environment saved successfully';
            });

        } catch (e) {
            result.message = 'Error saving environment: ' + e.message;
            log.error('Error saving environment: ' + e.message);
        }

        return result;
    },

    /**
     * Load environment
     * @param {string} environmentId - Environment ID
     * @returns {Object|null} Environment data
     */
    loadEnvironment: function (environmentId) {
        try {
            var customObject = CustomObjectMgr.getCustomObject('PostmanEnvironment', environmentId);
            if (customObject) {
                return {
                    id: customObject.custom.id,
                    name: customObject.custom.name,
                    description: customObject.custom.description,
                    workspaceId: customObject.custom.workspaceId || null,
                    variables: JSON.parse(customObject.custom.variables || '{}'),
                    createdAt: customObject.custom.createdAt,
                    updatedAt: customObject.custom.updatedAt
                };
            }
        } catch (e) {
            log.error('Error loading environment: ' + e.message);
        }

        return null;
    },

    /**
     * Delete environment
     * @param {string} environmentId - Environment ID
     * @returns {Object} Result object
     */
    deleteEnvironment: function (environmentId) {
        var result = {
            success: false,
            message: ''
        };

        try {
            Transaction.wrap(function () {
                var customObject = CustomObjectMgr.getCustomObject('PostmanEnvironment', environmentId);
                if (customObject) {
                    CustomObjectMgr.remove(customObject);
                    result.success = true;
                    result.message = 'Environment deleted successfully';
                } else {
                    result.message = 'Environment not found';
                }
            });

        } catch (e) {
            result.message = 'Error deleting environment: ' + e.message;
            log.error('Error deleting environment: ' + e.message);
        }

        return result;
    }
};

module.exports = PostmanService;
