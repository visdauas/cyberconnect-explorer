// credits: https://github.com/cyberconnecthq/api-demo/blob/main/src/context/web3Context.tsx

import React, { useState, useEffect, createContext, useCallback } from 'react';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import WalletLink from "walletlink";
import CyberConnect from '@cyberlab/cyberconnect';

interface Web3ContextInterface {
  connectWallet: () => void;
  disconnectWallet: () => void;
  address: string;
  ens: string | null;
  cyberConnect: CyberConnect | null;
  graphAddress: string;
  setGraphAddress: (address: string) => void;
  graphLoading: boolean,
  setGraphLoading: (loading: boolean) => void;
}

export const Web3Context = createContext<Web3ContextInterface>({
  connectWallet: async () => undefined,
  disconnectWallet: async () => undefined,
  address: '',
  ens: '',
  cyberConnect: null,
  graphAddress: '',
  setGraphAddress: async () => undefined,
  graphLoading: true,
  setGraphLoading: async () => undefined,
});

const infuraId = 'ad1fb45e65ee4979954883a2e88aa4c3';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: infuraId,
    },
  },
  walletlink: {
    package: WalletLink, // Required
    options: {
      appName: "CyberConnect Explorer", // Required
      infuraId: infuraId, // Required unless you provide a JSON RPC url; see `rpc` below
    }
  }
};

const Web3ContextProvider: React.FC = ({ children }) => {
  const [address, setAddress] = useState<string>('');
  const [ens, setEns] = useState<string | null>('');
  const [cyberConnect, setCyberConnect] = useState<CyberConnect | null>(null);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal | undefined>(undefined);
  const [graphAddress, setGraphAddress] = useState<string>('0x7c04786f04c522ca664bb8b6804e0d182eec505f');
  const [graphLoading, setGraphLoading] = useState<boolean>(true);

  async function getEnsByAddress(
    provider: ethers.providers.Web3Provider,
    address: string
  ) {
    const ens = await provider.lookupAddress(address);
    return ens;
  }

  const disconnectWallet = useCallback(async () => {
    setAddress('');
    setEns('');
  }, []);

  const subsribeProvider = useCallback(
    // @ts-ignore
    (provider: Web3Provider) => {
      provider.on('accountsChanged', (accounts: string[]) => {
        disconnectWallet();
      });

      // Subscribe to chainId change
      provider.on('chainChanged', (chainId: number) => {
        disconnectWallet();
        location.reload();
      });

      // Subscribe to provider disconnection
      provider.on('disconnect', (error: { code: number; message: string }) => {
        disconnectWallet();
      });
    },
    [disconnectWallet]
  );

  const initCyberConnect = useCallback((provider: any) => {
    const cyberConnect = new CyberConnect({
      provider,
      namespace: 'CyberConnect',
    });

    cyberConnect.authenticate();

    setCyberConnect(cyberConnect);
  }, []);

  const connectWallet = useCallback(async () => {
    if (!web3Modal) {
      console.error('web3modal not initialized');
      throw 'web3modal not initialized';
    }
    try {
      const instance = await web3Modal.connect();

      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const ens = await getEnsByAddress(provider, address);

      setAddress(address);
      setEns(ens);
      subsribeProvider(provider);

      initCyberConnect(provider.provider);
    } catch (e) {
      disconnectWallet();
      throw e;
    }
  }, [web3Modal, disconnectWallet, subsribeProvider, initCyberConnect]);

  useEffect(() => {
    const web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: true, // optional
      providerOptions, // required
    });

    setWeb3Modal(web3Modal);
  }, []);

  useEffect(() => {
    if (web3Modal != null && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [web3Modal]);

  return (
    <Web3Context.Provider
      value={{
        connectWallet,
        disconnectWallet,
        address,
        ens,
        cyberConnect,
        graphAddress,
        setGraphAddress,
        graphLoading,
        setGraphLoading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3ContextProvider;
