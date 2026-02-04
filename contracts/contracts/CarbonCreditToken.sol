// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract CarbonCreditToken is ERC20, ERC20Burnable, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event CreditRetired(address indexed burner, uint256 amount, string reason);

    constructor() ERC20("Algae Carbon Credit Beta", "ACC-B") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function retire(uint256 amount, string memory reason) public {
        burn(amount);
        emit CreditRetired(msg.sender, amount, reason);
    }

    // Override _update to restrict transfers (SBT-like behavior for Beta)
    function _update(address from, address to, uint256 value) internal virtual override {
        // Allow minting (from 0) and burning (to 0)
        // Disallow transfers between users
        if (from != address(0) && to != address(0)) {
            revert("CarbonCreditToken: Transfers are disabled in Beta");
        }
        super._update(from, to, value);
    }
}
