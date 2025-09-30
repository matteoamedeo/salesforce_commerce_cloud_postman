'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var PostmanService = require('*/cartridge/scripts/services/PostmanService');

/**
 * Main Postman interface page
 */
server.get('Show', function (req, res, next) {
    var workspaceId = req.querystring.workspaceId || null;
    res.render('postman/main', {
        title: Resource.msg('postman.title', 'postman', 'Postman API Tester'),
        workspaces: PostmanService.getWorkspaces(),
        currentWorkspaceId: workspaceId,
        collections: PostmanService.getCollections(workspaceId),
        environments: PostmanService.getEnvironments(workspaceId)
    });
    next();
});

/**
 * List workspaces
 */
server.get('ListWorkspaces', function (req, res, next) {
    res.json({ success: true, data: PostmanService.getWorkspaces() });
    next();
});

/**
 * Save workspace
 */
server.post('SaveWorkspace', function (req, res, next) {
    var workspaceData = JSON.parse(req.body.workspaceData);
    var result = PostmanService.saveWorkspace(workspaceData);
    res.json(result);
    next();
});

/**
 * Delete workspace
 */
server.post('DeleteWorkspace', function (req, res, next) {
    var workspaceId = req.body.workspaceId;
    var result = PostmanService.deleteWorkspace(workspaceId);
    res.json(result);
    next();
});

/**
 * Execute API request
 */
server.post('ExecuteRequest', function (req, res, next) {
    var requestData = JSON.parse(req.body.requestData);
    var result = PostmanService.executeRequest(requestData);
    
    res.json({
        success: result.success,
        data: result.data,
        error: result.error,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        headers: result.headers
    });
    next();
});

/**
 * Save collection
 */
server.post('SaveCollection', function (req, res, next) {
    var collectionData = JSON.parse(req.body.collectionData);
    var result = PostmanService.saveCollection(collectionData);
    
    res.json({
        success: result.success,
        message: result.message,
        collectionId: result.collectionId
    });
    next();
});

/**
 * Load collection
 */
server.get('LoadCollection', function (req, res, next) {
    var collectionId = req.querystring.collectionId;
    var collection = PostmanService.loadCollection(collectionId);
    
    res.json({
        success: collection ? true : false,
        data: collection
    });
    next();
});

/**
 * List collections (by optional workspace)
 */
server.get('ListCollections', function (req, res, next) {
    var workspaceId = req.querystring.workspaceId || null;
    var data = PostmanService.getCollections(workspaceId);
    res.json({ success: true, data: data });
    next();
});

/**
 * Delete collection
 */
server.post('DeleteCollection', function (req, res, next) {
    var collectionId = req.body.collectionId;
    var result = PostmanService.deleteCollection(collectionId);
    
    res.json({
        success: result.success,
        message: result.message
    });
    next();
});

/**
 * Save environment
 */
server.post('SaveEnvironment', function (req, res, next) {
    var environmentData = JSON.parse(req.body.environmentData);
    var result = PostmanService.saveEnvironment(environmentData);
    
    res.json({
        success: result.success,
        message: result.message,
        environmentId: result.environmentId
    });
    next();
});

/**
 * Load environment
 */
server.get('LoadEnvironment', function (req, res, next) {
    var environmentId = req.querystring.environmentId;
    var environment = PostmanService.loadEnvironment(environmentId);
    
    res.json({
        success: environment ? true : false,
        data: environment
    });
    next();
});

/**
 * List environments (by optional workspace)
 */
server.get('ListEnvironments', function (req, res, next) {
    var workspaceId = req.querystring.workspaceId || null;
    var data = PostmanService.getEnvironments(workspaceId);
    res.json({ success: true, data: data });
    next();
});

/**
 * Delete environment
 */
server.post('DeleteEnvironment', function (req, res, next) {
    var environmentId = req.body.environmentId;
    var result = PostmanService.deleteEnvironment(environmentId);
    
    res.json({
        success: result.success,
        message: result.message
    });
    next();
});

module.exports = server.exports();
