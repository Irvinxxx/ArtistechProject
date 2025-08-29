import React from 'react';
import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = ({ 
  children, 
  sidebarItems, 
  currentSection, 
  onSectionChange, 
  userType,
  user 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          items={sidebarItems}
          currentSection={currentSection}
          onSectionChange={onSectionChange}
          userType={userType}
          user={user}
        />
        
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
