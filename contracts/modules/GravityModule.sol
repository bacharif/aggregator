// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

import {BaseModule} from "./BaseModule.sol";
import {Logger} from "../Logger.sol";
import {IGravity} from "../interfaces/IGravity.sol";
import {Constants} from "../libraries/Constants.sol";

contract GravityModule is BaseModule {

    constructor(Logger logger) BaseModule(logger) {}

    function sendToCosmos(
        address _tokenContract,
        string memory _destination,
        uint256 _amount
    ) external {
        // Call the sendToCosmos function in the Gravity Bridge contract
        IGravity(Constants._GRAVITY).sendToCosmos(_tokenContract, _destination, _amount);

        LOGGER.log("SendToCosmos", abi.encode(_tokenContract, _destination, _amount));
    }

}