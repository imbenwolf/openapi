"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAPI = void 0;
const crypto = require("crypto");
const got_1 = require("got");
class OpenAPI {
    constructor({ key, secret, schema, region = 'us', handleToken = false }) {
        this.tokenAccess = '';
        this.tokenRefresh = '';
        this.tokenExpiresAt = new Date();
        this._key = key;
        this._secret = secret;
        this.schema = schema;
        this.handleToken = handleToken;
        this._client = got_1.default.extend({
            responseType: 'json',
            prefixUrl: `https://openapi.tuya${region}.com/v1.0/`,
            headers: {
                client_id: this._key,
                sign_method: 'HMAC-SHA256'
            },
            hooks: {
                beforeRequest: [
                    (options) => __awaiter(this, void 0, void 0, function* () {
                        const isTokenUrl = options.url.toString().includes('token');
                        if (!isTokenUrl && this.tokenAccess === '' && this.handleToken) {
                            yield this.getToken();
                        }
                        if (!isTokenUrl && this.isTokenExpired()) {
                            yield this.refreshToken();
                        }
                        const now = Date.now();
                        options.headers.t = now.toString();
                        // Calculate signature
                        let sign = '';
                        if (isTokenUrl) {
                            sign = crypto
                                .createHmac('sha256', this._secret)
                                .update(this._key + now.toString())
                                .digest('hex').toUpperCase();
                        }
                        else {
                            sign = crypto
                                .createHmac('sha256', this._secret)
                                .update(`${this._key}${this.tokenAccess}${now}`)
                                .digest('hex').toUpperCase();
                            options.headers.access_token = this.tokenAccess;
                        }
                        options.headers.sign = sign;
                    })
                ],
                afterResponse: [
                    (response) => {
                        const body = response.body;
                        if (!body.success) {
                            throw new Error(body.msg);
                        }
                        response.body = body.result;
                        return response;
                    }
                ]
            }
        });
    }
    // Authorization methods
    isTokenExpired() {
        return Date.now() > this.tokenExpiresAt.getTime();
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.handleToken) {
                throw new HandleTokenError();
            }
            const { body: { access_token, refresh_token, expire_time } } = yield this._client.get('token?grant_type=1');
            this.tokenAccess = access_token;
            this.tokenRefresh = refresh_token;
            this.tokenExpiresAt = new Date(Date.now() + (expire_time * 1000));
        });
    }
    refreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { access_token, refresh_token, expire_time } } = yield this._client.get(`token/${this.tokenRefresh}`);
            this.tokenAccess = access_token;
            this.tokenRefresh = refresh_token;
            this.tokenExpiresAt = new Date(Date.now() + (expire_time * 1000));
        });
    }
    // API methods
    putUser({ countryCode, username, password, usernameType, nickname }) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                schema: this.schema,
                country_code: countryCode,
                username,
                password,
                username_type: usernameType,
                nick_name: nickname
            };
            const response = yield this._client.post(`apps/${this.schema}/user`, {
                json: request
            });
            return response.body.uid;
        });
    }
    getUsers({ pageNumber, pageSize } = { pageNumber: 1, pageSize: 100 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`apps/${this.schema}/users`, {
                searchParams: {
                    page_no: pageNumber,
                    page_size: pageSize
                }
            });
            return response.body;
        });
    }
    getDeviceToken({ uid, timezone }) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.post('devices/token', {
                json: {
                    uid,
                    timeZoneId: timezone
                }
            });
            return response.body;
        });
    }
    getDevicesByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`devices/tokens/${token}`);
            return response.body;
        });
    }
    getDevicesByUser(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`users/${uid}/devices`);
            return response.body;
        });
    }
    getDevices({ ids, pageNumber = 0, pageSize = 100 } = { pageNumber: 0, pageSize: 100 }) {
        return __awaiter(this, void 0, void 0, function* () {
            const searchParameters = {
                schema: this.schema,
                page_no: pageNumber,
                page_size: pageSize
            };
            if (ids) {
                searchParameters.device_ids = ids.toString();
            }
            const response = yield this._client.get('devices', { searchParams: searchParameters });
            return response.body;
        });
    }
    getDevice(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`devices/${deviceId}`);
            return response.body;
        });
    }
    getDeviceStatus(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`devices/${deviceId}/status`);
            return response.body;
        });
    }
    getSubDevicesOfZigbeeGateway(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get(`devices/${deviceId}/sub-devices`);
            return response.body;
        });
    }
}
exports.OpenAPI = OpenAPI;
class HandleTokenError extends Error {
    constructor() {
        super('Token acquisition is automatically handled.');
    }
}
module.exports = OpenAPI;
