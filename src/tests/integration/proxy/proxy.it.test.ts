import { ContractFactory, ethers } from 'ethers';
import * as fs from 'fs';
import * as solc from 'solc';

describe('Create proxy full flow', () => {

  const PUBLIC_KEY = '0xdC3532b2ce6335acF0A03FB5efEAA0a65bb4E14e';
  const PRIVATE_KEY = '75c533c41230de328a82e4233c66f28fd2361df0576e5ca9e01acd029ee079f8';
  const USER_PRIVATE_KEY = '9d24b1743d5092f395b61a60d368db65590c92841e548f142da2e2b5c7f885fe';
  const IMPL_ADDRESS = '0x06878dA8c2fcC4Bf9d40B48b542E0cBbbD04EaC2';
  const PROXY_ADDRESS = '0xCE89E0DA2740e640cfe374C20CF0f3928cb6d265';

  let implFactory: ContractFactory;
  let proxyFactory: ContractFactory;
  let adminWallet: ethers.Wallet;
  let userWallet: ethers.Wallet;

  beforeAll(async () => {
    const signer = await ethers.getDefaultProvider('goerli');
    adminWallet = new ethers.Wallet(PRIVATE_KEY, signer);
    userWallet = new ethers.Wallet(USER_PRIVATE_KEY, signer);

    let metadata = compileContract('src/tests/integration/proxy/TestImplementation.sol');
    let abi = metadata.contracts['TestImplementation.sol'].TestImplementation.abi;
    let byteCode = metadata.contracts['TestImplementation.sol'].TestImplementation.evm.bytecode;
    implFactory = await new ContractFactory(abi, byteCode, adminWallet);

    metadata = compileContract('src/tests/integration/proxy/TestProxy.sol');
    abi = metadata.contracts['TestProxy.sol'].TestProxy.abi;
    byteCode = metadata.contracts['TestProxy.sol'].TestProxy.evm.bytecode;
    proxyFactory = await new ContractFactory(abi, byteCode, adminWallet);
  });

  it('deploy implementation contract', async () => {
    const implContract = await implFactory.deploy(2);
    await implContract.deployed();

    console.log('Implementation contract', implContract.address);
  }, 100000);

  it('deploy proxy contract', async () => {
    const proxyContract = await proxyFactory.deploy(IMPL_ADDRESS, PUBLIC_KEY, []);
    await proxyContract.deployed();

    console.log('Proxy contract', proxyContract.address);
  }, 50000);

  it('change proxy impl slot', async () => {
    const proxyContract = new ethers.Contract(PROXY_ADDRESS, proxyFactory.interface, adminWallet);
    await proxyContract.upgradeTo(IMPL_ADDRESS);

    console.log('Proxy contract impl slot updated', IMPL_ADDRESS);
  }, 50000);

  it('get proxy impl slot', async () => {
    const proxyContract = new ethers.Contract(PROXY_ADDRESS, proxyFactory.interface, adminWallet);
    const implAddress = await proxyContract.callStatic.implementation();

    console.log('Proxy contract impl', implAddress);
  }, 50000);

  it('invoke read values through proxy contract', async () => {
    const proxyContract = new ethers.Contract(PROXY_ADDRESS, implFactory.interface, userWallet);
    const version = await proxyContract.version();
    const value = await proxyContract.value();

    console.log('Proxy contract [version=%d, value=%d]', version, value);
  });

  it('invoke set value through proxy contract', async () => {
    const proxyContract = new ethers.Contract(PROXY_ADDRESS, implFactory.interface, userWallet);
    const value = await proxyContract.value();
    const tx = await proxyContract.setValue(parseInt(value) + 1);
    await tx.wait();

    console.log('Proxy contract updated');
  }, 100000);

  const compileContract = (contract: string): any => {
    const pathFragments = contract.split('/');
    const contractName = pathFragments.pop();
    const dependencyPath = pathFragments.join('/');

    const findImports = (path) => {
      const proxyPath = `${dependencyPath}/dependencies/${path}`;
      return {
        contents: fs.readFileSync(proxyPath).toString(),
      };
    };

    const input = {
      language: 'Solidity',
      sources: {
        [contractName]: {
          content: fs.readFileSync(contract).toString(),
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode'],
          },
        },
      },
    };
    return JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  };
});
