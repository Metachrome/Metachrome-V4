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
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';
import { LogOut, User } from 'lucide-react';
export function AdminHeader() {
    var _this = this;
    var user = useAuth().user;
    var _a = useLocation(), setLocation = _a[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var logoutMutation = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', '/api/auth/admin/logout')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            // Clear all auth-related data
            queryClient.setQueryData(['/api/auth/user'], null);
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out",
            });
            // Redirect to login
            setLocation('/admin/login');
        },
        onError: function (error) {
            console.error('Admin logout error:', error);
            // Even if logout fails, clear local state and redirect
            queryClient.setQueryData(['/api/auth/user'], null);
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            toast({
                title: "Logged Out",
                description: "You have been logged out (forced)",
            });
            setLocation('/admin/login');
        },
    });
    if (!user)
        return null;
    return (<div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">METACHROME Control Panel</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <User className="w-4 h-4"/>
            <span className="text-sm">{user.username}</span>
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">{user.role}</span>
          </div>
          
          <Button variant="outline" size="sm" onClick={function () { return logoutMutation.mutate(); }} disabled={logoutMutation.isPending} className="text-gray-300 border-gray-600 hover:bg-gray-700">
            <LogOut className="w-4 h-4 mr-2"/>
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>);
}
