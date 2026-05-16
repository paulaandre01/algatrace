'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAddress,
  getNetwork,
  isConnected as freighterIsConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
import { STELLAR_CONFIG } from '@/lib/stellar';

export type WalletState = {
  publicKey: string | null;
  isConnected: boolean;
  networkPassphrase: string | null;
  network: string | null;
};

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    networkPassphrase: null,
    network: null,
  });

  const connect = useCallback(async () => {
    try {
      const status = await freighterIsConnected();
      if (!status.isConnected) {
        alert('Instale/ative a Freighter para continuar.');
        return;
      }

      const allowed = await requestAccess();
      if (!allowed) return;

      const { address, error } = await getAddress();
      if (error || !address) throw error || new Error('Endereço não disponível');

      const net = await getNetwork().catch(() => null);

      setWallet({
        publicKey: address,
        isConnected: true,
        networkPassphrase: net?.networkPassphrase || STELLAR_CONFIG.networkPassphrase,
        network: net?.network || null,
      });
    } catch (error) {
      console.error('Failed to connect Freighter:', error);
      alert('Falha ao conectar com a Freighter.');
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      publicKey: null,
      isConnected: false,
      networkPassphrase: null,
      network: null,
    });
  }, []);

  const signTransactionXdr = useCallback(
    async (xdr: string) => {
      if (!wallet.publicKey) throw new Error('Carteira não conectada');
      const { signedTxXdr, error } = await freighterSignTransaction(xdr, {
        address: wallet.publicKey,
        networkPassphrase: wallet.networkPassphrase || STELLAR_CONFIG.networkPassphrase,
      });
      if (error || !signedTxXdr) throw error || new Error('Assinatura falhou');
      return signedTxXdr;
    },
    [wallet.publicKey, wallet.networkPassphrase]
  );

  useEffect(() => {
    freighterIsConnected()
      .then((status) => {
        if (status.isConnected) connect();
      })
      .catch(() => {});
  }, [connect, disconnect]);

  return { ...wallet, wallet, connect, disconnect, signTransactionXdr };
};
