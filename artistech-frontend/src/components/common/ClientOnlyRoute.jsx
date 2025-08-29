import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ClientOnlyRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // This case should be handled by the parent PrivateRoute, but as a fallback
    return <Navigate to="/login" replace />;
  }

  if (user.user_type !== 'client') {
    // If the user is logged in but is not a client, redirect them to their dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If the user is a client, render the nested route
  return <Outlet />;
};

export default ClientOnlyRoute; 