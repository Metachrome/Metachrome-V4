import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

interface Transaction {
  id: string;
  userId: string;
  type: string;
  symbol: string;
  amount: string;
  status: string;
  method: string;
  txHash?: string;
  metadata?: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending transactions
  const { data: pendingTransactions, isLoading } = useQuery({
    queryKey: ["/api/admin/transactions/pending"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Approve/reject transaction mutation
  const approveTransactionMutation = useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: 'approve' | 'reject'; reason?: string }) => {
      const response = await fetch(`/api/admin/transactions/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Action failed');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: variables.action === 'approve' ? 'Transaction Approved' : 'Transaction Rejected',
        description: `Transaction has been ${variables.action}d successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/pending'] });
      setSelectedTransaction(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Action Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getStatusBadge = (status: string, type: string) => {
    // For deposit/withdraw, show "rejected" instead of "failed"
    const displayStatus = (type === 'deposit' || type === 'withdraw') && status === 'failed' ? 'rejected' : status;

    switch (displayStatus) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{displayStatus}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseMetadata = (metadata?: string) => {
    try {
      return metadata ? JSON.parse(metadata) : {};
    } catch {
      return {};
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Transaction Management</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {pendingTransactions?.length || 0} Pending
          </Badge>
        </div>

        {!pendingTransactions || pendingTransactions.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pending Transactions</h3>
              <p className="text-gray-400">All transactions have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTransactions.map((transaction: Transaction) => (
              <Card key={transaction.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold">
                          {transaction.type.toUpperCase()} - {transaction.amount} {transaction.symbol}
                        </h3>
                        {getStatusBadge(transaction.status, transaction.type)}
                        <Badge variant="secondary">{transaction.method}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                        <div>
                          <span className="font-medium">User ID:</span>
                          <br />
                          {transaction.userId}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {formatDate(transaction.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Method:</span>
                          <br />
                          {transaction.method}
                        </div>
                        <div>
                          <span className="font-medium">TX Hash:</span>
                          <br />
                          {transaction.txHash ? (
                            <span className="font-mono text-xs break-all">
                              {transaction.txHash.substring(0, 20)}...
                            </span>
                          ) : 'N/A'}
                        </div>
                      </div>

                      {parseMetadata(transaction.metadata).transferReference && (
                        <div className="mb-4 p-3 bg-gray-700 rounded">
                          <span className="font-medium text-sm">Bank Transfer Reference:</span>
                          <br />
                          <span className="font-mono">{parseMetadata(transaction.metadata).transferReference}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-white">Transaction Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
                              {JSON.stringify(transaction, null, 2)}
                            </pre>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={() => approveTransactionMutation.mutate({ id: transaction.id, action: 'approve' })}
                        disabled={approveTransactionMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Reject Transaction</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-300">Rejection Reason</label>
                              <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                className="bg-gray-700 border-gray-600 text-white mt-2"
                              />
                            </div>
                            <Button
                              onClick={() => approveTransactionMutation.mutate({ 
                                id: transaction.id, 
                                action: 'reject', 
                                reason: rejectionReason 
                              })}
                              disabled={approveTransactionMutation.isPending || !rejectionReason}
                              variant="destructive"
                              className="w-full"
                            >
                              {approveTransactionMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
