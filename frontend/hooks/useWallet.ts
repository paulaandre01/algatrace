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

  return { ...wallet, wallet, connect, disconnect };
};
