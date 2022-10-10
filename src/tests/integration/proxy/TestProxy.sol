pragma solidity ^0.8.0;

import "./proxy/transparent/TransparentUpgradeableProxy.sol";

contract TestProxy is TransparentUpgradeableProxy {

  constructor(address _logic, address admin_, bytes memory _data) TransparentUpgradeableProxy (_logic, admin_, _data) {}
}
