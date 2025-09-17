import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetamaskResult {
  success: boolean;
  address?: string;
  error?: string;
}

export function useMetamask() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { metamaskLogin } = useAuth();

  const isMetamaskAvailable = useCallback(() => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }, []);

  const connectWallet = useCallback(async (): Promise<MetamaskResult> => {
    if (!isMetamaskAvailable()) {
      return {
        success: false,
        error: "Metamask is not installed. Please install Metamask to continue.",
      };
    }

    try {
      setIsConnecting(true);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        return {
          success: false,
          error: "No accounts found. Please make sure Metamask is unlocked.",
        };
      }

      const address = accounts[0];

      // Get chain ID to ensure we're on the right network
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      console.log("Connected to chain:", chainId);

      // Send to backend for authentication (skip signature for now)
      try {
        console.log("🔄 Authenticating with backend...");
        const authResult = await metamaskLogin({ walletAddress: address });
        console.log("✅ Backend authentication successful:", authResult);
      } catch (authError) {
        console.error("❌ Backend authentication failed:", authError);
        throw new Error(`Authentication failed: ${authError.message || 'Unknown error'}`);
      }

      return {
        success: true,
        address,
      };
    } catch (error: any) {
      console.error("Metamask connection error:", error);

      let errorMessage = "Failed to connect to Metamask";
      
      if (error.code === 4001) {
        errorMessage = "User rejected the connection request";
      } else if (error.code === -32002) {
        errorMessage = "Connection request is already pending. Please check Metamask.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsConnecting(false);
    }
  }, [isMetamaskAvailable, metamaskLogin]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!isMetamaskAvailable()) {
      throw new Error("Metamask is not available");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        throw new Error("Network not found. Please add it manually in Metamask.");
      }
      throw error;
    }
  }, [isMetamaskAvailable]);

  const addToken = useCallback(async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number) => {
    if (!isMetamaskAvailable()) {
      throw new Error("Metamask is not available");
    }

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
          },
        },
      });
    } catch (error) {
      console.error("Error adding token:", error);
      throw error;
    }
  }, [isMetamaskAvailable]);

  const getBalance = useCallback(async (address: string) => {
    if (!isMetamaskAvailable()) {
      throw new Error("Metamask is not available");
    }

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert from wei to ETH
      return parseInt(balance, 16) / Math.pow(10, 18);
    } catch (error) {
      console.error("Error getting balance:", error);
      throw error;
    }
  }, [isMetamaskAvailable]);

  return {
    isMetamaskAvailable: isMetamaskAvailable(),
    isConnecting,
    connectWallet,
    switchNetwork,
    addToken,
    getBalance,
  };
}
