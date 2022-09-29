import Opcode from "@services/opcode/opcode";
import {Operation} from "@ethersproject/asm";

class ProxyOpcode extends Opcode {

  private readonly proxyImplSlots = new Map([
    ["0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc", "eip1967.proxy.implementation"], // event Upgraded
    ["0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50", "eip1967.proxy.beacon"], // event BeaconUpgraded, trzeba odpytać beacon proxy po impl (niby jest metoda implementation())
    ["0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7", "eip1822.uups.proxable"], // proxable
    ["0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3", "org.zeppelinos.proxy.implementation"]
  ]);
  private readonly proxyAdminSlots = new Map([
    ["0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103", "eip1967.proxy.admin"], // even AdminChanged
    ["0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b", "org.zeppelinos.proxy.admin"]
  ]);
  private readonly filters = [this.fetchProxyNodes, this.fetchImplSlot, this.fetchAdminSlot];

  private proxyOpOffsets: number[] = [];
  private proxyImplSlot: string;
  private proxyAdminSlot: string;

  constructor(protected sourceCode: string) {
    super(sourceCode);
    this.opcodes.forEach((op: Operation) => {
      this.filters.forEach(filter => filter.call(this, op));
    });
  }

  public isProxyContract(): boolean {
    return this.proxyOpOffsets.length > 0;
  }

  public getProxyType(): string {
    return this.proxyImplSlots.get(this.proxyImplSlot);
  }

  public getProxyImplSlot(): string {
    return this.proxyImplSlot;
  }

  public getProxyAdminSlot(): string {
    return this.proxyAdminSlot;
  }

  private fetchProxyNodes(op: Operation): void {
    if (op.opcode.mnemonic === "DELEGATECALL") {
      this.proxyOpOffsets.push(op.offset);
    }
  }

  private fetchImplSlot(op: Operation): void {
    if (op.opcode.mnemonic === "PUSH32") {
      if (this.proxyImplSlots.has(op.pushValue)) {
        this.proxyImplSlot = op.pushValue;
      }
    }
  }

  private fetchAdminSlot(op: Operation): void {
    if (op.opcode.mnemonic === "PUSH32") {
      if (this.proxyAdminSlots.has(op.pushValue)) {
        this.proxyAdminSlot = op.pushValue;
      }
    }
  }

}

export default ProxyOpcode;
