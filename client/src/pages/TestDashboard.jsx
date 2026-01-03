import React from 'react';
import { useAuth } from '../hooks/useAuth';
export default function TestDashboard() {
    var user = useAuth().user;
    return (<div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1>Test Dashboard</h1>
      <p>This is a test dashboard to check if the basic routing works.</p>
      
      {user ? (<div>
          <h2>Welcome, {user.username}!</h2>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Balance: ${user.balance}</p>
        </div>) : (<div>
          <p>No user logged in</p>
        </div>)}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Navigation Test</h3>
        <a href="/dashboard" style={{ marginRight: '10px' }}>Back to Dashboard</a>
        <a href="/" style={{ marginRight: '10px' }}>Home</a>
        <a href="/admin" style={{ marginRight: '10px' }}>Admin</a>
      </div>
    </div>);
}
