// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity 0.8.20;

import {Constants} from "./Constants.sol";
import {ERC20, SafeTransferLib} from 'solmate/src/utils/SafeTransferLib.sol';

library TokenUtils {
    using SafeTransferLib for ERC20;

    function _approve(address _token, address _to, uint256 _amount) internal {
        if (_token == Constants._ETH) return;

        if (ERC20(_token).allowance(address(this), _to) < _amount || _amount == 0) {
            ERC20(_token).safeApprove(_to, _amount);
        }
    }

    function _transferFrom(address _token, address _from, uint256 _amount) internal returns (uint256) {
        if (_amount == type(uint256).max) {
            _amount = _balanceInOf(_token, _from);
        }

        if (_from != address(0) && _from != address(this) && _token != Constants._ETH && _amount != 0) {
            ERC20(_token).safeTransferFrom(_from, address(this), _amount);

            return _amount;
        }

        return 0;
    }

    function _transfer(address _token, address _to, uint256 _amount) internal returns (uint256) {
        if (_amount == type(uint256).max) {
            _amount = _balanceInOf(_token, address(this));
        }

        if (_to != address(0) && _to != address(this) && _amount != 0) {
            if (_token != Constants._ETH) {
                ERC20(_token).safeTransfer(_to, _amount);
            } else {
                SafeTransferLib.safeTransferETH(_to, _amount);
            }

            return _amount;
        }

        return 0;
    }

    function _balanceInOf(address _token, address _acc) internal view returns (uint256) {
        if (_token == Constants._ETH) {
            return _acc.balance;
        } else {
            return ERC20(_token).balanceOf(_acc);
        }
    }
}