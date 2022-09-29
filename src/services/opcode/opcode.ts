import {Bytecode, Operation} from "@ethersproject/asm/src.ts/assembler";
import {disassemble} from "@ethersproject/asm";

class Opcode {

  protected readonly opcodes: Bytecode;
  protected readonly nodes: Map<number, Operation[]>;

  constructor(protected sourceCode: string) {
    this.opcodes = disassemble(sourceCode);
    this.nodes = this.getNodes(this.opcodes);
  }

  private getNodes(opcodes: Bytecode): Map<number, Operation[]> {
    const nodeMap = new Map([[0, [this.opcodes[0]]]]);
    let lastJumpOp = opcodes[0];

    opcodes.forEach(op => {
      if (op.opcode.isValidJumpDest()) {
        lastJumpOp = op;
        nodeMap.set(op.offset, [op]);
      } else {
        nodeMap.get(lastJumpOp.offset).push(op);
      }
    });
    return nodeMap;
  }

}

export default Opcode;
