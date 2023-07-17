// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

interface IGravity {
    function sendToCosmos(
        address _tokenContract,
        string calldata _destination,
        uint256 _amount
    ) external;
}