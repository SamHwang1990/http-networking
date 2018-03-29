/**
 * Created by zhiyuan.huang@ddder.net.
 */

'use strict';

const CreateClass = require('../classify.js').create;
const axios = require('../axios.js');
const stringFormat = require('../stringFormat.js');

const Constants = require('./Constants.js');

const GeneratorMap = new Map();
const generatorInstanceMap = new Map();

const Service = require('./Service.js');

const RequestGenerator = CreateClass({
    serviceKey: Constants.DEFAULT_SERVICE_KEY,

    initialize: function() {
        let ServiceClass = Service.findService(this.serviceKey);

        this._service = new ServiceClass();
        this._axios = axios.create({
            timeout: 10000
        });
    },

    $delete: function(method, params) {
        return this.generateRequest('delete', method, params)
    },

    $get: function(method, params) {
        return this.generateRequest('get', method, params)
    },

    $post: function(method, params) {
        return this.generateRequest('post', method, params)
    },

    $put: function(method, params) {
        return this.generateRequest('put', method, params)
    },

    captureRequestError: function(error, requestMeta) {
        if (!error) return;

        const errorMsg = error instanceof Error ? error.message : error.toString();
        log(stringFormat(
            'service throw error `{errorMsg}` when {requestMethod} `{paramsStr}` to {requestUrl}',
            Object.assign({errorMsg}, requestMeta)
        ));
    },

    generateRequest: function(requestMethod, apiMethod, params = {}, requestOptions = {}) {
        this._service.extraFormUrlencodedParams(params);

        const requestUrl = this._service.requestUrlGeneration(apiMethod);
        const requestMeta = {
            requestMethod,
            requestUrl,
            params,
            paramsStr: JSON.stringify(params)
        };

        return this.initRequestPromise(requestMethod, requestUrl, params, requestOptions).then(response => {
            let result = this._service.responseHandler(response, requestMeta);
            return result || response;
        }, err => {
            this.captureRequestError(err, requestMeta);
            throw err;
        });
    },

    initRequestPromise: function(requestMethod, requestUrl, params, requestOptions) {
        return this._axios[requestMethod](
            requestUrl,
            params,
            Object.assign({}, requestOptions, this.extraRequestOptions(requestMethod))
        );
    },

    extraRequestOptions: function(/*method*/) {},

    Statics: {
        register: function(options) {
            let newGenerator = RequestGenerator.extend(options);
            let serviceKey = newGenerator.prototype.serviceKey;

            if (!GeneratorMap.has(serviceKey)) {
                GeneratorMap.set(serviceKey, newGenerator);
            }

            return newGenerator;
        },
        findGenerator: function(serviceKey) {
            let instance = generatorInstanceMap.get(serviceKey);
            if (!instance) {
                const GeneratorClass = GeneratorMap.get(serviceKey);
                if (!GeneratorClass) return new RequestGenerator();

                instance = new GeneratorClass();
                generatorInstanceMap.set(serviceKey, instance);
            }

            return instance;
        }
    }
});

GeneratorMap.set(RequestGenerator.prototype._serviceKey, RequestGenerator);

module.exports = RequestGenerator;