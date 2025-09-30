'use strict';

/**
 * @namespace Postman
 */

/**
 * Renders the main Postman API Tester interface
 */
function start() {
    require('dw/template/ISML').renderTemplate('postman/main', {
        title: 'Postman API Tester',
        message: 'Welcome to Postman API Tester! This is a test page to verify the cartridge integration.'
    });
}

start.public = true;

exports.Start = start;
