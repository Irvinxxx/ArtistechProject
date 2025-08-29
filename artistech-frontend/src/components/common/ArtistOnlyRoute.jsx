import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ArtistOnlyRoute = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.user_type !== 'artist') {
    // Redirect them to the home page if not an artist.
    // You can also redirect to a specific 'unauthorized' page.
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default ArtistOnlyRoute;
