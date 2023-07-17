// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

import {Registry} from "./Registry.sol";
import {Owned} from "./libraries/Owned.sol";
import {IDSProxy} from "./interfaces/IDSProxy.sol";
import {Constants} from "./libraries/Constants.sol";
import {IRegistry} from "./interfaces/IRegistry.sol";

/// @title Liquity
/// @notice Allows interaction with multiple protocols for DSProxy or any delegateCall type contract.
/// @author @Mutative_
contract Liquidity is Registry, Owned {
    /// @notice Address of this contract.
    IRegistry internal immutable _Registry;

    constructor(address _owner) Owned(_owner) {
        _Registry = IRegistry(address(this));
    }

    ////////////////////////////////////////////////////////////////
    /// --- REGISTRY FUNCTIONS
    ///////////////////////////////////////////////////////////////

    /// @notice Sees {Registry-_getModule}.
    function getModule(bytes1 identifier) external view returns (address) {
        return _getModule(identifier);
    }

    /// @notice Sees {Registry-_setModule}.
    function setModule(bytes1 identifier, address module) external onlyOwner {
        _setModule(identifier, module);
    }

    /// @notice Call multiple functions in the current contract and return the data from all of them if they all succeed
    /// @param data The encoded function data for each of the calls to make to this contract
    /// @return results The results from each of the calls passed in via data
    function multicall(bytes[] calldata data)
        public
        payable
        returns (bytes32[] memory results)
    {
        results = new bytes32[](data.length);
        uint256 _length = data.length;

        for (uint256 i = 0; i < _length;) {
            // Decode the first item of the array into a module identifier and the associated function data
            (bytes1 _moduleIdentifier, bytes memory _moduleData) = abi.decode(data[i], (bytes1, bytes));

            results[i] = execute(_Registry.getModule(_moduleIdentifier), _moduleData);

            unchecked {
                ++i;
            }
        }
    }

    function execute(address _target, bytes memory _data)
        public
        payable
        returns (bytes32 response)
    {
        require(_target !=  address(0), "Liquity: target-invalid");

        // call contract in current context
        assembly {
            let succeeded := delegatecall(sub(gas(), 5000), _target, add(_data, 0x20), mload(_data), 0, 32)
            response := mload(0)      // load delegatecall output
            switch iszero(succeeded)
            case 1 {
                // throw if delegatecall failed
                revert(0, 0)
            }
        }
    }

    function version() external pure returns (string memory) {
        return "1.0.0";
    }

    receive() external payable {}
}