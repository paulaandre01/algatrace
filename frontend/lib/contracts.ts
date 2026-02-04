import { ethers } from 'ethers';
import AlgaeProjectNFTAbi from './abis/AlgaeProjectNFT.json';
import CarbonCreditTokenAbi from './abis/CarbonCreditToken.json';
import MRVRegistryAbi from './abis/MRVRegistry.json';

export const CONTRACT_ADDRESSES = {
  AlgaeProjectNFT: process.env.NEXT_PUBLIC_ALGAE_PROJECT_NFT_ADDRESS || '',
  CarbonCreditToken: process.env.NEXT_PUBLIC_CARBON_CREDIT_TOKEN_ADDRESS || '',
  MRVRegistry: process.env.NEXT_PUBLIC_MRV_REGISTRY_ADDRESS || '',
};

export const getContract = (
  address: string,
  abi: any,
  provider: ethers.Provider | ethers.Signer
) => {
  return new ethers.Contract(address, abi, provider);
};

export const getAlgaeProjectNFT = (provider: ethers.Provider | ethers.Signer) => {
  return getContract(CONTRACT_ADDRESSES.AlgaeProjectNFT, AlgaeProjectNFTAbi.abi, provider);
};

export const getCarbonCreditToken = (provider: ethers.Provider | ethers.Signer) => {
  return getContract(CONTRACT_ADDRESSES.CarbonCreditToken, CarbonCreditTokenAbi.abi, provider);
};

export const getMRVRegistry = (provider: ethers.Provider | ethers.Signer) => {
  return getContract(CONTRACT_ADDRESSES.MRVRegistry, MRVRegistryAbi.abi, provider);
};
