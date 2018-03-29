/**
 * Created by zhiyuan.huang@ddder.net.
 */

'use strict';

const createApiProvider = require('./ApiProvider.js');
const registerRequestGenerator = require('./RequestGenerator.js').register;
const registerService = require('./Service.js').register;

module.exports = {
    createApiProvider,
    registerRequestGenerator,
    registerService
};