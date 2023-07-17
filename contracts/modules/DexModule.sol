// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

import {ERC20, SafeTransferLib} from "../libraries/SafeTransferLib.sol";

import {BaseModule} from "./BaseModule.sol";
import {Constants} from "../libraries/Constants.sol";
import {Logger} from "../Logger.sol";
import {TokenUtils} from "../libraries/TokenUtils.sol";

/// @notice Contract that allows to swap tokens through different aggregators.
contract DexModule is BaseModule {
    using SafeTransferLib for ERC20;

    /// @notice Error when swap fails.
    error SWAP_FAILED();

    /// @notice Kyberswap contract address.
    address public constant KYBERSWAP_ROUTER = 0x1c87257F5e8609940Bc751a07BB085Bb7f8cDBE6;


    constructor(Logger logger) BaseModule(logger) {}

    modifier onlyValidDex(address _dex) {
        if (_dex != KYBERSWAP_ROUTER) {
            revert Constants.INVALID_DEX();
        }
        _;
    }

    function exchange(
        address dex,
        address srcToken,
        address destToken,
        uint256 underlyingAmount,
        bytes memory callData
    ) external payable onlyValidDex(dex) returns (uint256 received) {
        bool success;
        uint256 before = destToken == Constants._ETH ? address(this).balance : ERC20(destToken).balanceOf(address(this));

        if (srcToken == Constants._ETH) {
            (success,) = dex.call{value: underlyingAmount}(callData);
        } else {
            TokenUtils._approve(srcToken, dex, underlyingAmount);
            (success,) = dex.call(callData);
        }
        if (!success) revert SWAP_FAILED();

        if (destToken == Constants._ETH) {
            received = address(this).balance - before;
        } else {
            received = ERC20(destToken).balanceOf(address(this)) - before;
        }

        LOGGER.log("Swap", abi.encode(srcToken, destToken, underlyingAmount, received));
    }
}