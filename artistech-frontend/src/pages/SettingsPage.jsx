import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ArtistSkillsSettings from '../components/ArtistSkillsSettings';

const SettingsPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Placeholder for general account settings */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">Account Information</h2>
          <p className="text-gray-500 mt-4">General account settings will be available here.</p>
        </div>

        {/* Conditionally render artist-specific settings */}
        {user && user.userType === 'artist' && (
          <ArtistSkillsSettings />
        )}
        
        {/* Placeholder for client-specific settings */}
        {user && user.userType === 'client' && (
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold">Preferences</h2>
            <p className="text-gray-500 mt-4">Client-specific settings will be available here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 