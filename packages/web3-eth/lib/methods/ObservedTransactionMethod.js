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
 * @file AbstractSendMethod.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import {AbstractMethod} from 'web3-core-method';
import PromiEvent from '../PromiEvent';

export default class ObservedTransactionMethod extends AbstractMethod {
    /**
     * @param {String} rpcMethod
     * @param {Number} parametersAmount
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {TransactionObserver} transactionObserver
     *
     * @constructor
     */
    constructor(rpcMethod, parametersAmount, utils, formatters, transactionObserver) {
        super(rpcMethod, parametersAmount, utils, formatters);

        this.transactionObserver = transactionObserver;
        this.promiEvent = new PromiEvent();
    }

    static get ObservedTransactionMethod() {
        return true;
    }

    /**
     * Sends the request and returns a PromiEvent Object
     *
     * @method execute
     *
     * @param {AbstractWeb3Module} moduleInstance
     *
     * @callback callback callback(error, result)
     * @returns {PromiEvent}
     */
    execute(moduleInstance) {
        this.beforeExecution(moduleInstance);

        if (this.parameters.length !== this.parametersAmount) {
            throw new Error(
                `Invalid Arguments length: expected: ${this.parametersAmount}, given: ${this.parameters.length}`
            );
        }

        moduleInstance.currentProvider.send(this.rpcMethod, this.parameters).then((transactionHash) => {
            promiEvent.emit('transactionHash', transactionHash);

            if (this.callback) {
                this.callback(false, response);
            }

            let count, receipt;
            this.transactionObserver.observe(transactionHash, moduleInstance)
                .subscribe(
                    (confirmation) => {
                        count = confirmation.count;
                        receipt = confirmation.receipt;

                        promiEvent.emit('confirmation', count, receipt);
                    },
                    (error) => {
                        if (this.callback) {
                            this.callback(error, null);
                        }

                        promiEvent.reject(error);
                        promiEvent.emit('error', error, receipt, count);
                        promiEvent.removeAllListeners();
                    },
                    () => {
                        if (method.callback) {
                            method.callback(false, receipt);
                        }

                        promiEvent.resolve(receipt);
                        promiEvent.emit('receipt', receipt);
                        promiEvent.removeAllListeners();
                    }
                );
        });

        return promiEvent;
    }
}
