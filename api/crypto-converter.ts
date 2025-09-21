import type { NextApiRequest, NextApiResponse } from 'next';

// Real-time cryptocurrency prices (in production, fetch from CoinGecko/CoinMarketCap)
const CRYPTO_PRICES = {
  BTC: 65000,   // Bitcoin price in USDT
  ETH: 3500,    // Ethereum price in USDT
  SOL: 150,     // Solana price in USDT
  USDT: 1,      // USDT is always 1:1
  BNB: 600,     // Binance Coin price in USDT
  USDC: 1,      // USD Coin is always 1:1
  BUSD: 1       // Binance USD is always 1:1
};

// Conversion fees (percentage)
const CONVERSION_FEES = {
  BTC: 0.001,   // 0.1% fee for BTC conversion
  ETH: 0.001,   // 0.1% fee for ETH conversion
  SOL: 0.002,   // 0.2% fee for SOL conversion
  USDT: 0,      // No fee for USDT
  BNB: 0.001,   // 0.1% fee for BNB conversion
  USDC: 0,      // No fee for USDC
  BUSD: 0       // No fee for BUSD
};

/**
 * Convert any cryptocurrency amount to USDT equivalent
 * @param amount - Amount of cryptocurrency
 * @param fromCurrency - Source cryptocurrency symbol
 * @returns Object with USDT amount and conversion details
 */
export function convertToUSDT(amount: number, fromCurrency: string): {
  usdtAmount: number;
  originalAmount: number;
  originalCurrency: string;
  conversionRate: number;
  fee: number;
  feePercentage: number;
  netAmount: number;
} {
  const currency = fromCurrency.toUpperCase();
  
  // Get current price
  const conversionRate = CRYPTO_PRICES[currency as keyof typeof CRYPTO_PRICES] || 0;
  
  if (conversionRate === 0) {
    throw new Error(`Unsupported cryptocurrency: ${currency}`);
  }
  
  // Calculate gross USDT amount
  const grossUSDT = amount * conversionRate;
  
  // Calculate conversion fee
  const feePercentage = CONVERSION_FEES[currency as keyof typeof CONVERSION_FEES] || 0.005; // Default 0.5% fee
  const fee = grossUSDT * feePercentage;
  
  // Calculate net USDT amount after fee
  const netAmount = grossUSDT - fee;
  
  return {
    usdtAmount: grossUSDT,
    originalAmount: amount,
    originalCurrency: currency,
    conversionRate,
    fee,
    feePercentage: feePercentage * 100, // Convert to percentage
    netAmount: Math.max(0, netAmount) // Ensure non-negative
  };
}

/**
 * Process cryptocurrency deposit with automatic USDT conversion
 * @param userId - User ID
 * @param amount - Deposit amount
 * @param currency - Cryptocurrency symbol
 * @param txHash - Transaction hash (optional)
 * @returns Conversion result
 */
export async function processDepositWithConversion(
  userId: string,
  amount: number,
  currency: string,
  txHash?: string
): Promise<{
  success: boolean;
  conversion: ReturnType<typeof convertToUSDT>;
  newBalance: number;
  transactionId: string;
}> {
  try {
    // Convert to USDT
    const conversion = convertToUSDT(amount, currency);
    
    // Generate transaction ID
    const transactionId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // In a real implementation, you would:
    // 1. Update user balance in database
    // 2. Create transaction record
    // 3. Log conversion details
    
    console.log('🔄 CRYPTO CONVERSION:', {
      userId,
      original: `${amount} ${currency}`,
      converted: `${conversion.netAmount.toFixed(2)} USDT`,
      fee: `${conversion.fee.toFixed(2)} USDT (${conversion.feePercentage}%)`,
      rate: `1 ${currency} = ${conversion.conversionRate} USDT`,
      transactionId,
      txHash
    });
    
    return {
      success: true,
      conversion,
      newBalance: conversion.netAmount, // This would be added to existing balance
      transactionId
    };
    
  } catch (error) {
    console.error('❌ Crypto conversion failed:', error);
    throw error;
  }
}

/**
 * Get current cryptocurrency prices
 */
export function getCurrentPrices(): typeof CRYPTO_PRICES {
  return { ...CRYPTO_PRICES };
}

/**
 * Get conversion fees
 */
export function getConversionFees(): typeof CONVERSION_FEES {
  return { ...CONVERSION_FEES };
}

/**
 * API endpoint for cryptocurrency conversion
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { amount, fromCurrency, userId, txHash } = req.body;
      
      if (!amount || !fromCurrency) {
        return res.status(400).json({
          success: false,
          error: 'Amount and fromCurrency are required'
        });
      }
      
      const result = await processDepositWithConversion(
        userId || 'unknown',
        parseFloat(amount),
        fromCurrency,
        txHash
      );
      
      return res.json(result);
      
    } catch (error) {
      console.error('❌ Conversion API error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed'
      });
    }
  }
  
  if (req.method === 'GET') {
    // Return current prices and fees
    return res.json({
      success: true,
      prices: getCurrentPrices(),
      fees: getConversionFees(),
      supportedCurrencies: Object.keys(CRYPTO_PRICES)
    });
  }
  
  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  });
}
