'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export type WalletState = {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    provider: null,
    signer: null,
    address: null,
    isConnected: false,
    chainId: null,
  });

  const connect = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setWallet({
          provider,
          signer,
          address: accounts[0],
          isConnected: true,
          chainId: Number(network.chainId),
        });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Web3 wallet.");
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      provider: null,
      signer: null,
      address: null,
      isConnected: false,
      chainId: null,
    });
  }, []);

  const switchToLocalhost = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }], // 31337
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7A69',
                  chainName: 'Hardhat Localhost',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                },
              ],
            });
          } catch (addError) {
            console.error('Failed to add network:', addError);
          }
        } else {
          console.error('Failed to switch network:', switchError);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // Listen for account changes
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          connect();
        } else {
          disconnect();
        }
      });
      
      // Listen for chain changes
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      // Check if already connected
      (window as any).ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connect();
        }
      });
    }
  }, [connect, disconnect]);

  return { ...wallet, wallet, connect, disconnect, switchToLocalhost };
};
