/**
 * Created by zhiyuan.huang@ddder.net.
 */

'use strict';

const CreateClass = require('../classify.js').create;
const RequestGenerator = require('./RequestGenerator.js');
const _ = require('lodash');

const ApiProxy = CreateClass({
    initialize: function(config = {}) {
        this._serviceKey = config.serviceKey;
        this._requestGenerator = RequestGenerator.findGenerator(this._serviceKey);
        this._cacheable = config.cacheable !== false;
        this._apiMethodName = config.method;
        this._requestMethodName = config.requestMethod || 'post';
        this._beforeRespond = config.beforeRespond;
        this._defaultParams = config.defaultParams;
    },
    validator: function(/*params*/) { return true; },
    exec: function*(params, requestOptions, options = {}) {
        if (_.isFunction(params)) {
            params = params(this._apiMethodName);
        } else if (_.isPlainObject(params) && params.hasOwnProperty(this._apiMethodName)) {
            params = params[this._apiMethodName];
        }

        // TODO: 以下只适合PlainObject 的assign，对于blob 不适用
        if (this._defaultParams) {
            params = Object.assign({}, this._defaultParams, params);
        }

        if (this.validator(params) === false) {
            throw new Error('this.validator(params) === false');
        }

        let requestMethodName = this._requestMethodName;
        let apiMethodName = this._apiMethodName;

        if (typeof apiMethodName === 'function') {
            apiMethodName = apiMethodName(params, requestOptions);
        }

        let response = yield this._requestGenerator.generateRequest(requestMethodName, apiMethodName, params, requestOptions);

        if (_.isFunction(this._beforeRespond)) {
            this._beforeRespond(response);
        }

        if (_.isFunction(options.reformer)) {
            return yield Promise.resolve(options.reformer(response));
        } else {
            return response;
        }
    }
});

function CreateProvider(config = {}) {
    let proxy = new ApiProxy(config);
    return (function*(params, options = {}) {
        if (!options.reformer && config.reformer) {
            options.reformer = config.reformer;
        }

        const requestOptions = Object.assign({}, config.requestOptions, options.requestOptions);

        return yield proxy.exec(params, requestOptions, options);
    }).bind(proxy);
}

module.exports = CreateProvider;