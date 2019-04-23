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
 * @file txpool-tests.ts
 * @author Prince <sinhaprince013@gmail.com>
 * @date 2019
 */

import {Txpool} from 'web3-eth-txpool';
import {Content} from 'web3-core';

const txpool = new Txpool('http://localhost:8545');

// $ExpectType Promise<Content>
txpool.getContent();

// $ExpectType Promise<Content>
txpool.getContent((error: Error, result: Content) => {});

// $ExpectType Promise<Content>
txpool.getInspection();

// $ExpectType Promise<Content>
txpool.getInspection((error: Error, result: Content) => {});

// $ExpectType Promise<Content>
txpool.getStatus();

// $ExpectType Promise<Content>
txpool.getStatus((error: Error, result: Content) => {});
