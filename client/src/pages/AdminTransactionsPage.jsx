var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
export default function AdminTransactionsPage() {
    var _this = this;
    var _a = useState(null), selectedTransaction = _a[0], setSelectedTransaction = _a[1];
    var _b = useState(''), rejectionReason = _b[0], setRejectionReason = _b[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    // Fetch pending transactions
    var _c = useQuery({
        queryKey: ["/api/admin/transactions/pending"],
        refetchInterval: 30000, // Refresh every 30 seconds
    }), pendingTransactions = _c.data, isLoading = _c.isLoading;
    // Approve/reject transaction mutation
    var approveTransactionMutation = useMutation({
        mutationFn: function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
            var response, errorData;
            var id = _b.id, action = _b.action, reason = _b.reason;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, fetch("/api/admin/transactions/".concat(id, "/approve"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ action: action, reason: reason }),
                        })];
                    case 1:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        errorData = _c.sent();
                        throw new Error(errorData.message || 'Action failed');
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data, variables) {
            toast({
                title: variables.action === 'approve' ? 'Transaction Approved' : 'Transaction Rejected',
                description: "Transaction has been ".concat(variables.action, "d successfully"),
            });
            queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/pending'] });
            setSelectedTransaction(null);
            setRejectionReason('');
        },
        onError: function (error) {
            toast({
                title: 'Action Failed',
                description: error.message,
                variant: 'destructive',
            });
        },
    });
    var getStatusBadge = function (status, type) {
        // For deposit/withdraw, show "rejected" instead of "failed"
        var displayStatus = (type === 'deposit' || type === 'withdraw') && status === 'failed' ? 'rejected' : status;
        switch (displayStatus) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1"/>Pending</Badge>;
            case 'completed':
                return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1"/>Completed</Badge>;
            case 'failed':
                return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1"/>Failed</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>;
            default:
                return <Badge variant="outline">{displayStatus}</Badge>;
        }
    };
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString();
    };
    var parseMetadata = function (metadata) {
        try {
            return metadata ? JSON.parse(metadata) : {};
        }
        catch (_a) {
            return {};
        }
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Transaction Management</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Transaction Management</h1>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {(pendingTransactions === null || pendingTransactions === void 0 ? void 0 : pendingTransactions.length) || 0} Pending
          </Badge>
        </div>

        {!pendingTransactions || pendingTransactions.length === 0 ? (<Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
              <h3 className="text-xl font-semibold mb-2">No Pending Transactions</h3>
              <p className="text-gray-400">All transactions have been processed.</p>
            </CardContent>
          </Card>) : (<div className="space-y-4">
            {pendingTransactions.map(function (transaction) { return (<Card key={transaction.id} className="bg-gray-800 border-gray-700">
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
                          {transaction.txHash ? (<span className="font-mono text-xs break-all">
                              {transaction.txHash.substring(0, 20)}...
                            </span>) : 'N/A'}
                        </div>
                      </div>

                      {parseMetadata(transaction.metadata).transferReference && (<div className="mb-4 p-3 bg-gray-700 rounded">
                          <span className="font-medium text-sm">Bank Transfer Reference:</span>
                          <br />
                          <span className="font-mono">{parseMetadata(transaction.metadata).transferReference}</span>
                        </div>)}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={function () { return setSelectedTransaction(transaction); }}>
                            <Eye className="w-4 h-4 mr-1"/>
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

                      <Button onClick={function () { return approveTransactionMutation.mutate({ id: transaction.id, action: 'approve' }); }} disabled={approveTransactionMutation.isPending} className="bg-green-600 hover:bg-green-700" size="sm">
                        <CheckCircle className="w-4 h-4 mr-1"/>
                        Approve
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <XCircle className="w-4 h-4 mr-1"/>
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
                              <Textarea value={rejectionReason} onChange={function (e) { return setRejectionReason(e.target.value); }} placeholder="Enter reason for rejection..." className="bg-gray-700 border-gray-600 text-white mt-2"/>
                            </div>
                            <Button onClick={function () { return approveTransactionMutation.mutate({
                    id: transaction.id,
                    action: 'reject',
                    reason: rejectionReason
                }); }} disabled={approveTransactionMutation.isPending || !rejectionReason} variant="destructive" className="w-full">
                              {approveTransactionMutation.isPending ? 'Processing...' : 'Confirm Rejection'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>); })}
          </div>)}
      </div>
    </div>);
}
