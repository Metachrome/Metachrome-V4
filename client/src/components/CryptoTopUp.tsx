import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Copy, CheckCircle, Clock, AlertTriangle, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DepositRequest {
  depositId: string;
  depositAddress: string;
  amount: number;
  currency: string;
  instructions: {
    network: string;
    address: string;
    amount: number;
    steps: string[];
    warnings: string[];
  };
  expiresAt: string;
  status?: 'pending' | 'verifying' | 'completed' | 'failed';
}

interface DepositStatus {
  depositId: string;
  status: 'pending' | 'verifying' | 'completed' | 'failed';
  amount: number;
  currency: string;
  txHash?: string;
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
}

export function CryptoTopUp() {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'instructions' | 'proof' | 'status'>('form');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [depositRequest, setDepositRequest] = useState<DepositRequest | null>(null);
  const [txHash, setTxHash] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Step 1: Create deposit request
  const handleCreateDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/transactions/deposit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create deposit request');
      }

      const data = await response.json();
      setDepositRequest(data);
      setStep('instructions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit transaction proof
  const handleSubmitProof = async () => {
    if (!txHash.trim()) {
      setError('Please enter your transaction hash');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions/submit-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          depositId: depositRequest?.depositId,
          txHash: txHash.trim(),
          walletAddress: walletAddress.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit proof');
      }

      const data = await response.json();
      setStep('status');
      
      // Start polling for status updates
      pollDepositStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Poll for deposit status
  const pollDepositStatus = async () => {
    if (!depositRequest?.depositId) return;

    try {
      const response = await fetch(`/api/transactions/deposit-status/${depositRequest.depositId}`);
      if (response.ok) {
        const status = await response.json();
        setDepositStatus(status);
        
        // Continue polling if still processing
        if (status.status === 'verifying' || status.status === 'pending') {
          setTimeout(pollDepositStatus, 5000); // Poll every 5 seconds
        }
      }
    } catch (err) {
      console.error('Failed to check deposit status:', err);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset form
  const resetForm = () => {
    setStep('form');
    setAmount('');
    setCurrency('USDT');
    setDepositRequest(null);
    setTxHash('');
    setWalletAddress('');
    setDepositStatus(null);
    setError('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'verifying':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'verifying':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to access the top-up feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Cryptocurrency Top-Up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Amount and Currency Selection */}
        {step === 'form' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT (Tether)</SelectItem>
                    <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                    <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateDeposit} 
              disabled={loading || !amount}
              className="w-full"
            >
              {loading ? 'Creating Deposit...' : 'Generate Deposit Address'}
            </Button>
          </div>
        )}

        {/* Step 2: Deposit Instructions */}
        {step === 'instructions' && depositRequest && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Deposit Instructions</h3>
              <p className="text-blue-700 text-sm">
                Send exactly <strong>{depositRequest.amount} {depositRequest.currency}</strong> to the address below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Network</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  {depositRequest.instructions.network}
                </div>
              </div>

              <div>
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input 
                    value={depositRequest.depositAddress} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(depositRequest.depositAddress)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Amount</Label>
                <div className="p-3 bg-gray-50 rounded border font-semibold">
                  {depositRequest.amount} {depositRequest.currency}
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {depositRequest.instructions.warnings.map((warning, index) => (
                    <div key={index} className="text-sm">{warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="txHash">Transaction Hash</Label>
                <Input
                  id="txHash"
                  placeholder="Enter your transaction hash"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="walletAddress">Your Wallet Address (Optional)</Label>
                <Input
                  id="walletAddress"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitProof} 
                  disabled={loading || !txHash.trim()}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Transaction Proof'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Status Monitoring */}
        {step === 'status' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Deposit Status</h3>
              {depositStatus && (
                <Badge className={getStatusColor(depositStatus.status)}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(depositStatus.status)}
                    {depositStatus.status.toUpperCase()}
                  </div>
                </Badge>
              )}
            </div>

            {depositStatus && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Amount</Label>
                    <div className="font-semibold">{depositStatus.amount} {depositStatus.currency}</div>
                  </div>
                  <div>
                    <Label>Deposit ID</Label>
                    <div className="font-mono text-xs">{depositStatus.depositId}</div>
                  </div>
                </div>

                {depositStatus.txHash && (
                  <div>
                    <Label>Transaction Hash</Label>
                    <div className="font-mono text-xs break-all p-2 bg-gray-50 rounded">
                      {depositStatus.txHash}
                    </div>
                  </div>
                )}

                {depositStatus.status === 'completed' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your deposit has been successfully processed! Your account balance has been updated.
                    </AlertDescription>
                  </Alert>
                )}

                {depositStatus.status === 'verifying' && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Your transaction is being verified. This usually takes 5-15 minutes.
                    </AlertDescription>
                  </Alert>
                )}

                {depositStatus.status === 'failed' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your deposit failed to process. Please contact support for assistance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button onClick={resetForm} className="w-full">
              Make Another Deposit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
