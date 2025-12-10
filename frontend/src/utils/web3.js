import { BrowserProvider, Contract } from 'ethers';

let provider = null;
let signer = null;

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    
    return {
      address,
      chainId: Number(network.chainId)
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getProvider = () => {
  if (!provider) {
    if (typeof window.ethereum !== 'undefined') {
      provider = new BrowserProvider(window.ethereum);
    }
  }
  return provider;
};

export const getSigner = async () => {
  if (!signer) {
    const prov = getProvider();
    if (prov) {
      signer = await prov.getSigner();
    }
  }
  return signer;
};

export const getContract = async (address, abi) => {
  const sign = await getSigner();
  return new Contract(address, abi, sign);
};

export const switchNetwork = async (chainId) => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }]
    });
  } catch (error) {
    console.error('Error switching network:', error);
    throw error;
  }
};

export const onAccountsChanged = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};

export const onChainChanged = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('chainChanged', callback);
  }
};

export const removeListeners = () => {
  if (window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};
