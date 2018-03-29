/**
 * Created by zhiyuan.huang@ddder.net.
 */

'use strict';

const stringFormat = require('../stringFormat.js');
const CreateClass = require('../classify.js').create;
const Constants = require('./Constants.js');

const ServiceMap = new Map();

const Service = CreateClass({
    apiBaseUrl: null,
    apiVersion: null,
    serviceKey: Constants.DEFAULT_SERVICE_KEY,

    extraUrlParams: function() {},
    extraFormUrlencodedParams: function(params) { return params; },

    getBaseUrl: function() {
        let baseUrl = this.apiBaseUrl;
        if (baseUrl[baseUrl.length - 1] !== '/') {
            baseUrl += '/';
        }

        if (!this.apiVersion) return baseUrl;

        if (this.apiVersion) {
            baseUrl += (this.apiVersion + '/');
        }

        return baseUrl;
    },

    responseHandler: function(response, requestMeta = {}) {},

    requestUrlGeneration: function(methodName) {
        methodName = methodName.split('.').join('/');
        return this.getBaseUrl() + methodName;
    },

    Statics: {
        register: function(options) {
            let newService = Service.extend(options);
            let serviceKey = newService.prototype.serviceKey;

            if (!ServiceMap.has(serviceKey)) {
                ServiceMap.set(serviceKey, newService);
            }

            return newService;
        },
        findService: function(serviceKey) {
            let targetService = ServiceMap.get(serviceKey);
            if (!targetService) {
                targetService = Service;
            }

            return targetService;
        }
    }
});

let oriExtend = Service.extend;
Service.extend = function(options) {
    let newService = oriExtend.call(this, options);
    let serviceKey = Constants.DEFAULT_SERVICE_KEY;

    if (!ServiceMap.has(serviceKey)) {
        ServiceMap.set(serviceKey, newService);
    }

    return newService;
};

ServiceMap.set(Constants.DEFAULT_SERVICE_KEY, Service);

module.exports = Service;