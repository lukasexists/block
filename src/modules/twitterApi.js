import {requestConfigs} from '../config'
import Storage from "./storage";

/**
 * @description
 * Twitter API methods. This module includes all available
 * API endpoints that can be called from this extension to
 * Twitter server.
 *
 * This module must run in the browser tab within the Twitter
 * web app context (twitter.com), to populate the correct
 * request headers.
 *
 * @module
 * @name TwitterApi
 */
export default class TwitterApi {

    /**
     * Map Twitter API user object to local model
     * @param description - bio text
     * @param screen_name - handle
     * @param id_str - unique id str
     * @param name - user's display name
     * @returns {{name: string, bio: string, handle: string, id: string}}
     */
    static mapUser({description, screen_name, id_str, name}) {
        return {
            bio: description,
            id: id_str,
            name: name,
            handle: screen_name
        }
    }

    /**
     * Parse raw API response
     * @param {string} response - response from API
     * @param {function} callback - function to call on success
     * @param {function} errorCallback - function to call on error
     */
    static tryParseBios(response, callback, errorCallback) {
        try {
            callback(JSON.parse(response).map(TwitterApi.mapUser));
        } catch (e) {
            errorCallback()
        }
    }

    /**
     * Request user bios
     * @param {string[]} handles - user handles to check
     * @param {string} bearer - authentication Bearer token
     * @param {string} csrf - csrf token
     * @param {function} callback handler for successful bio request
     * @param {function} errorCallback - handler when this request cannot be completed
     */
    static getTheBio(handles, bearer, csrf, callback, errorCallback) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', requestConfigs.bioEndpoint(handles.join(',')), true);
        xhr.setRequestHeader('Authorization', bearer);
        xhr.setRequestHeader('x-csrf-token', csrf);
        xhr.onload = _ => {
            if (xhr.readyState === 4) {
                TwitterApi.tryParseBios(xhr.response,
                    callback, errorCallback)
            }
        }
        xhr.onerror = _ => errorCallback();
        xhr.send();
    }

    /**
     * Block a specific user
     * @param id - user id str
     * @param bearer - authentication bearer token
     * @param csrf - csrf token
     */
    static doTheBlock(id, bearer, csrf) {
        const xhr = new window.XMLHttpRequest();
        xhr.open('POST', requestConfigs.blockEndpoint, true);
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('Authorization', bearer);
        xhr.setRequestHeader('x-csrf-token', csrf);
        xhr.setRequestHeader('x-twitter-active-user', 'yes');
        xhr.setRequestHeader('x-twitter-auth-type', 'OAuth2Session');
        xhr.onload = _ => {
            if (xhr.status === 200) {
                Storage.incrementCount();
            }
        }
        xhr.send('user_id=' + id);
    }
}
