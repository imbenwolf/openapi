import { Device } from './device';
import { DevicesResponse, DeviceTokenResponse, PairingResultResponse, UsersResponse } from './responses';
export { Device, Status } from './device';
export declare class OpenAPI {
    tokenAccess: string;
    tokenRefresh: string;
    tokenExpiresAt: Date;
    schema: string;
    handleToken: boolean;
    private readonly _client;
    private readonly _key;
    private readonly _secret;
    constructor({ key, secret, schema, region, handleToken }: {
        key: string;
        secret: string;
        schema: string;
        region: string;
        handleToken: boolean;
    });
    isTokenExpired(): boolean;
    getToken(): Promise<void>;
    refreshToken(): Promise<void>;
    putUser({ countryCode, username, password, usernameType, nickname }: {
        countryCode: string;
        username: string;
        password: string;
        usernameType: string;
        nickname: string;
    }): Promise<string>;
    getUsers({ pageNumber, pageSize }?: {
        pageNumber: number;
        pageSize: number;
    }): Promise<UsersResponse>;
    getDeviceToken({ uid, timezone }: {
        uid: string;
        timezone: string;
    }): Promise<DeviceTokenResponse>;
    getDevicesByToken(token: string): Promise<PairingResultResponse>;
    getDevicesByUser(uid: string): Promise<Device[]>;
    getDevices({ ids, pageNumber, pageSize }?: {
        ids?: string[];
        pageNumber: number;
        pageSize: number;
    }): Promise<DevicesResponse>;
    getDevice(deviceId: string): Promise<Device>;
    getDeviceStatus(deviceId: string): Promise<Device['status']>;
    getSubDevicesOfZigbeeGateway(deviceId: string): Promise<Device>;
}
