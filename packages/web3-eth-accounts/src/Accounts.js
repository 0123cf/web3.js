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
 * @file Accounts.js
 * @author Samuel Furter <samuel@ethereum.org>, Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import isObject from 'lodash/isObject';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';
import Hash from 'eth-lib/lib/hash';
import RLP from 'eth-lib/lib/rlp';
import Bytes from 'eth-lib/lib/bytes';
import scryptsy from 'scrypt.js';
import uuid from 'uuid';
const crypto = typeof global === 'undefined' ? require('crypto-browserify') : require('crypto'); // TODO: This should moved later to the factory method

//TODO: Rename Accounts module to Wallet and add the functionalities of the current Wallet class.
export default class Accounts {
    /**
     * @param {Utils} utils
     * @param {Object} formatters
     * @param {TransactionSigner} transactionSigner
     * @param {Wallet} wallet
     * @param {Object} options
     *
     * @constructor
     */
    constructor(utils, formatters, transactionSigner, wallet, options) {
        this.utils = utils;
        this.formatters = formatters;
        this.wallet = wallet;
        this.transactionSigner = transactionSigner;

        return new Proxy(this, {
            get: (target, name) => {
                return target[name];
            }
        });
    }

    /**
     * Creates an account with a given entropy
     *
     * @method create
     *
     * @param {String} entropy
     *
     * @returns {Account}
     */
    create(entropy) {
        return Account.from(entropy);
    }

    /**
     * Creates an Account object from a privateKey
     *
     * @method privateKeyToAccount
     *
     * @param {String} privateKey
     *
     * @returns {Account}
     */
    privateKeyToAccount(privateKey) {
        return Account.fromPrivateKey(privateKey);
    }


    /**
     * TODO: Add deprecation message and extend the signTransaction method in the eth module
     *
     * Signs a transaction object with the given privateKey
     *
     * @method signTransaction
     *
     * @param {Object} tx
     * @param {String} privateKey
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {Promise<Object>}
     */
    async signTransaction(tx, privateKey, callback) {
        try {
            const transaction = new Transaction(tx);
            const signedTransaction = await this.transactionSigner.sign(transaction, privateKey);

            if (isFunction(callback)) {
                callback(false, signedTransaction);
            }

            return signedTransaction;
        } catch (error) {
            if (isFunction(callback)) {
                callback(error, null);
            }

            throw error;
        }
    }

    /**
     * Recovers transaction
     *
     * @method recoverTransaction
     *
     * @param {String} rawTx
     *
     * @returns {String}
     */
    recoverTransaction(rawTx) {
        const values = RLP.decode(rawTx);
        const signature = Account.encodeSignature(values.slice(6, 9));
        const recovery = Bytes.toNumber(values[6]);
        const extraData = recovery < 35 ? [] : [Bytes.fromNumber((recovery - 35) >> 1), '0x', '0x'];
        const signingData = values.slice(0, 6).concat(extraData);
        const signingDataHex = RLP.encode(signingData);

        return Account.recover(Hash.keccak256(signingDataHex), signature);
    }

    /**
     * Hashes a given message
     *
     * @method hashMessage
     *
     * @param {String} data
     *
     * @returns {String}
     */
    hashMessage(data) {
        const message = this.utils.isHexStrict(data) ? this.utils.hexToBytes(data) : data;
        const messageBuffer = Buffer.from(message);
        const preamble = `\u0019Ethereum Signed Message:\n${message.length}`;
        const preambleBuffer = Buffer.from(preamble);
        const ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);

        return Hash.keccak256s(ethMessage);
    }

    /**
     * Signs a string with the given privateKey
     *
     * @method sign
     *
     * @param {String} data
     * @param {String} privateKey
     *
     * @returns {Object}
     */
    sign(data, privateKey) {
        return Account.fromPrivateKey(privateKey).sign(data);
    }

    /**
     * Recovers the Ethereum address which was used to sign the given data.
     *
     * @method recover
     *
     * @param {String|Object} message
     * @param {String} signature
     * @param {Boolean} preFixed
     *
     * @returns {String}
     */
    recover(message, signature, preFixed) {
        const args = [].slice.apply(arguments);

        if (isObject(message)) {
            return this.recover(message.messageHash, Account.encodeSignature([message.v, message.r, message.s]), true);
        }

        if (!preFixed) {
            message = this.hashMessage(message);
        }

        if (args.length >= 4) {
            preFixed = args.slice(-1)[0];
            preFixed = isBoolean(preFixed) ? preFixed : false;

            return this.recover(message, Account.encodeSignature(args.slice(1, 4)), preFixed); // v, r, s
        }

        return Account.recover(message, signature);
    }

    /**
     * Decrypts account
     *
     * Note: Taken from https://github.com/ethereumjs/ethereumjs-wallet
     *
     * @method decrypt
     *
     * @param {Object|String} v3Keystore
     * @param {String} password
     * @param {Boolean} nonStrict
     *
     * @returns {Account}
     */
    decrypt(v3Keystore, password, nonStrict) {
        return Account.fromV3Keystore(v3Keystore, password, nonStrict);
    }

    /**
     * Encrypts the account
     *
     * @method encrypt
     *
     * @param {String} privateKey
     * @param {String} password
     * @param {Object} options
     *
     * @returns {Object}
     */
    encrypt(privateKey, password, options) {
        return Account.fromPrivateKey(privateKey).toV3Keystore(password, option)
    }
}
