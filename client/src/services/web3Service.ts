declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TransactionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

interface TokenContract {
  address: string;
  decimals: number;
  symbol: string;
}

// Common token contracts
const TOKENS: Record<string, TokenContract> = {
  USDT_ETH: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
  },
  USDT_BSC: {
    address: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
    symbol: 'USDT',
  },
  BTC_ETH: {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    decimals: 8,
    symbol: 'WBTC',
  },
};

class Web3Service {
  private provider: any = null;

  // Initialize Web3 provider
  async initialize(): Promise<boolean> {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = window.ethereum;
      return true;
    }
    return false;
  }

  // Connect to MetaMask
  async connectWallet(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('MetaMask not installed');
    }

    try {
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      });
      return accounts;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to connect wallet');
    }
  }

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      });
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting current account:', error);
      return null;
    }
  }

  // Get ETH balance
  async getETHBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      return ethBalance.toFixed(6);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get balance');
    }
  }

  // Get token balance (ERC-20)
  async getTokenBalance(address: string, tokenSymbol: string, network: 'ETH' | 'BSC' = 'ETH'): Promise<string> {
    const tokenKey = `${tokenSymbol}_${network}`;
    const token = TOKENS[tokenKey];
    
    if (!token) {
      throw new Error(`Token ${tokenSymbol} not supported on ${network}`);
    }

    try {
      // ERC-20 balanceOf function call
      const data = `0x70a08231000000000000000000000000${address.slice(2)}`;
      
      const result = await this.provider.request({
        method: 'eth_call',
        params: [{
          to: token.address,
          data: data,
        }, 'latest'],
      });

      const balance = parseInt(result, 16) / Math.pow(10, token.decimals);
      return balance.toFixed(token.decimals);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get token balance');
    }
  }

  // Send ETH transaction
  async sendETH(to: string, amount: string): Promise<TransactionResult> {
    if (!this.provider) {
      return { success: false, error: 'Provider not initialized' };
    }

    try {
      const from = await this.getCurrentAccount();
      if (!from) {
        return { success: false, error: 'No account connected' };
      }

      const value = '0x' + (parseFloat(amount) * Math.pow(10, 18)).toString(16);

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from,
          to,
          value,
        }],
      });

      return { success: true, txHash };
    } catch (error: any) {
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  // Send token transaction (ERC-20)
  async sendToken(to: string, amount: string, tokenSymbol: string, network: 'ETH' | 'BSC' = 'ETH'): Promise<TransactionResult> {
    const tokenKey = `${tokenSymbol}_${network}`;
    const token = TOKENS[tokenKey];
    
    if (!token) {
      return { success: false, error: `Token ${tokenSymbol} not supported on ${network}` };
    }

    try {
      const from = await this.getCurrentAccount();
      if (!from) {
        return { success: false, error: 'No account connected' };
      }

      // ERC-20 transfer function call
      const value = (parseFloat(amount) * Math.pow(10, token.decimals)).toString(16).padStart(64, '0');
      const toAddress = to.slice(2).padStart(64, '0');
      const data = `0xa9059cbb000000000000000000000000${toAddress}${value}`;

      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from,
          to: token.address,
          data,
        }],
      });

      return { success: true, txHash };
    } catch (error: any) {
      return { success: false, error: error.message || 'Token transfer failed' };
    }
  }

  // Switch network
  async switchNetwork(chainId: string): Promise<boolean> {
    if (!this.provider) return false;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      return true;
    } catch (error: any) {
      // If network doesn't exist, you might want to add it
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  // Add token to MetaMask
  async addTokenToWallet(tokenSymbol: string, network: 'ETH' | 'BSC' = 'ETH'): Promise<boolean> {
    const tokenKey = `${tokenSymbol}_${network}`;
    const token = TOKENS[tokenKey];
    
    if (!token || !this.provider) return false;

    try {
      await this.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
          },
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to add token:', error);
      return false;
    }
  }

  // Get transaction receipt
  async getTransactionReceipt(txHash: string): Promise<any> {
    if (!this.provider) return null;

    try {
      return await this.provider.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }
}

export const web3Service = new Web3Service();
