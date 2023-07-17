// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

/// @notice Constants used in Morphous.
library Constants {
    /// @notice ETH address.
    address internal constant _ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @notice The address of GRAVITY address.
    address public constant _GRAVITY = 0xa4108aA1Ec4967F8b52220a4f7e94A8201F2D906;

    /// @notice Address of Factory Guard contract.
    address internal constant _FACTORY_GUARD_ADDRESS = 0x5a15566417e6C1c9546523066500bDDBc53F88C7;

    /////////////////////////////////////////////////////////////////
    /// --- ERRORS
    ////////////////////////////////////////////////////////////////

    /// @dev Error message when the caller is not allowed to call the function.
    error NOT_ALLOWED();

    /// @dev Error message when array length is invalid.
    error INVALID_LENGTH();

    /// @dev Error message when the caller is not allowed to call the function.
    error INVALID_INITIATOR();

    /// @dev Error message when the dex is invalid.
    error INVALID_DEX();

    /// @dev Error message when the deadline has passed.
    error DEADLINE_EXCEEDED();

    /// @dev Error message for when the amount of received tokens is less than the minimum amount.
    error NOT_ENOUGH_RECEIVED();
}