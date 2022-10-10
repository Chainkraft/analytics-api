// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract TestImplementation {

  int32 public version;
  int public value;

  constructor(int32 _version) {
    version = _version;
  }

  function setValue(int _value) external {
    value = _value;
  }
}
