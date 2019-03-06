/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file SignMethod.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import {SignMethod as CoreSignMethod} from 'web3-core-method';

export default class SignMethod extends CoreSignMethod {
    /**
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {AbstractWeb3Module} moduleInstance
     *
     * @constructor
     */
    constructor(utils, formatters, moduleInstance) {
        super(utils, formatters, moduleInstance);
    }

    /**
     * Sends a JSON-RPC call request
     *
     * @method execute
     *
     * @param {AbstractWeb3Module} moduleInstance
     *
     * @callback callback callback(error, result)
     * @returns {Promise<Object|String>}
     */
    execute(moduleInstance) {
        if (moduleInstance.accounts.wallet[this.parameters[1]]) {
            return this.signLocally(moduleInstance);
        }

        return super.execute();
    }

    /**
     * Signs the message on the client.
     *
     * @method signLocally
     *
     * @param {AbstractWeb3Module} moduleInstance
     *
     * @returns {Promise<String>}
     */
    async signLocally(moduleInstance) {
        try {
            this.beforeExecution(moduleInstance);

            let signedMessage = moduleInstance.accounts.sign(
                this.parameters[0],
                moduleInstance.accounts.wallet[this.parameters[1]].address
            );

            if (this.callback) {
                this.callback(false, signedMessage);
            }

            return signedMessage;
        } catch (error) {
            if (this.callback) {
                this.callback(error, null);
            }

            throw error;
        }
    }
}
