import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { MessageSquare, Send, Clock, User, AlertTriangle, CheckCircle, Search, Reply, Archive, Tag } from 'lucide-react';
export default function SupportCommunicationCenter(_a) {
    var _b;
    var chatMessages = _a.chatMessages, supportTickets = _a.supportTickets, onReplyToTicket = _a.onReplyToTicket, onSendChatMessage = _a.onSendChatMessage, onUpdateTicketStatus = _a.onUpdateTicketStatus, onAssignTicket = _a.onAssignTicket, currentAdminId = _a.currentAdminId, _c = _a.isLoading, isLoading = _c === void 0 ? false : _c;
    var _d = useState(null), selectedTicket = _d[0], setSelectedTicket = _d[1];
    var _e = useState(''), replyMessage = _e[0], setReplyMessage = _e[1];
    var _f = useState(''), searchTerm = _f[0], setSearchTerm = _f[1];
    var _g = useState('all'), statusFilter = _g[0], setStatusFilter = _g[1];
    var _h = useState('all'), priorityFilter = _h[0], setPriorityFilter = _h[1];
    var _j = useState(false), isReplyDialogOpen = _j[0], setIsReplyDialogOpen = _j[1];
    var getPriorityBadge = function (priority) {
        var colors = {
            low: 'bg-gray-600',
            medium: 'bg-blue-600',
            high: 'bg-orange-600',
            urgent: 'bg-red-600'
        };
        return (<Badge className={"".concat(colors[priority], " text-white")}>
        {priority.toUpperCase()}
      </Badge>);
    };
    var getStatusBadge = function (status) {
        var colors = {
            open: 'bg-green-600',
            in_progress: 'bg-blue-600',
            resolved: 'bg-purple-600',
            closed: 'bg-gray-600'
        };
        return (<Badge className={"".concat(colors[status], " text-white")}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>);
    };
    var getCategoryIcon = function (category) {
        var icons = {
            technical: <AlertTriangle className="w-4 h-4"/>,
            financial: <CheckCircle className="w-4 h-4"/>,
            account: <User className="w-4 h-4"/>,
            trading: <MessageSquare className="w-4 h-4"/>,
            other: <Tag className="w-4 h-4"/>
        };
        return icons[category] || <Tag className="w-4 h-4"/>;
    };
    var handleReplySubmit = function () {
        if (!selectedTicket || !replyMessage.trim())
            return;
        onReplyToTicket(selectedTicket.id, replyMessage, 'in_progress');
        setReplyMessage('');
        setIsReplyDialogOpen(false);
        setSelectedTicket(null);
    };
    var filteredTickets = supportTickets.filter(function (ticket) {
        var _a;
        var matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ((_a = ticket.user) === null || _a === void 0 ? void 0 : _a.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
        var matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });
    var unreadMessages = chatMessages.filter(function (msg) { return msg.status === 'unread'; }).length;
    var openTickets = supportTickets.filter(function (ticket) { return ticket.status === 'open'; }).length;
    var urgentTickets = supportTickets.filter(function (ticket) { return ticket.priority === 'urgent'; }).length;
    return (<div className="space-y-6">
      {/* Communication Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Unread Messages</p>
                <p className="text-3xl font-bold text-white">{unreadMessages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Open Tickets</p>
                <p className="text-3xl font-bold text-white">{openTickets}</p>
              </div>
              <Clock className="w-8 h-8 text-green-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-600 to-red-700 border-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Urgent Tickets</p>
                <p className="text-3xl font-bold text-white">{urgentTickets}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200"/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Tickets</p>
                <p className="text-3xl font-bold text-white">{supportTickets.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-200"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets Management */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <MessageSquare className="w-5 h-5"/>
                <span>Support Tickets</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage and respond to user support requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <Input placeholder="Search tickets by subject, user, or description..." value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} className="pl-10 bg-gray-700 border-gray-600 text-white"/>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Status"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                <SelectValue placeholder="Priority"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tickets Table */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-700">
                  <TableHead className="text-gray-300">Ticket</TableHead>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Subject</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Priority</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Assigned To</TableHead>
                  <TableHead className="text-gray-300">Created</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map(function (ticket) {
            var _a, _b, _c, _d, _e;
            return (<TableRow key={ticket.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell>
                      <div className="text-white font-mono text-sm">
                        #{ticket.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {(_b = (_a = ticket.user) === null || _a === void 0 ? void 0 : _a.username) === null || _b === void 0 ? void 0 : _b.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white text-sm">{(_c = ticket.user) === null || _c === void 0 ? void 0 : _c.username}</div>
                          <div className="text-gray-400 text-xs">{(_d = ticket.user) === null || _d === void 0 ? void 0 : _d.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium max-w-xs truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-gray-400 text-sm max-w-xs truncate">
                        {ticket.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-white text-sm capitalize">{ticket.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <div className="text-white text-sm">
                        {((_e = ticket.admin) === null || _e === void 0 ? void 0 : _e.username) || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white text-sm">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(ticket.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={function () {
                    setSelectedTicket(ticket);
                    setIsReplyDialogOpen(true);
                }} className="text-gray-400 hover:text-white">
                          <Reply className="w-4 h-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={function () { return onUpdateTicketStatus(ticket.id, 'resolved'); }} className="text-gray-400 hover:text-white" disabled={ticket.status === 'resolved' || ticket.status === 'closed'}>
                          <CheckCircle className="w-4 h-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={function () { return onUpdateTicketStatus(ticket.id, 'closed'); }} className="text-gray-400 hover:text-white" disabled={ticket.status === 'closed'}>
                          <Archive className="w-4 h-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>);
        })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              Reply to Ticket #{selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.id.slice(0, 8)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.subject}</span>
                {selectedTicket && getPriorityBadge(selectedTicket.priority)}
              </div>
              <p className="text-gray-300 text-sm">{selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.description}</p>
              <div className="flex items-center space-x-4 mt-3 text-xs text-gray-400">
                <span>From: {(_b = selectedTicket === null || selectedTicket === void 0 ? void 0 : selectedTicket.user) === null || _b === void 0 ? void 0 : _b.username}</span>
                <span>Created: {selectedTicket && new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>
            </div>
            
            <div>
              <label className="text-white text-sm font-medium mb-2 block">Your Reply</label>
              <Textarea value={replyMessage} onChange={function (e) { return setReplyMessage(e.target.value); }} placeholder="Type your reply here..." className="bg-gray-700 border-gray-600 text-white min-h-32"/>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={function () {
            setIsReplyDialogOpen(false);
            setReplyMessage('');
            setSelectedTicket(null);
        }}>
                Cancel
              </Button>
              <Button onClick={handleReplySubmit} disabled={!replyMessage.trim()}>
                <Send className="w-4 h-4 mr-2"/>
                Send Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
