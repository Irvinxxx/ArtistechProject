import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  User, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardSidebar = ({ 
  items, 
  currentSection, 
  onSectionChange, 
  userType,
  user 
}) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 truncate">{user?.name}</h2>
                <p className="text-sm text-gray-500 capitalize">{userType}</p>
              </div>
            </div>
          )}
          
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-3",
              isCollapsed && "px-3 justify-center",
              currentSection === item.id && "bg-purple-600 text-white hover:bg-purple-700"
            )}
            onClick={() => {
              if (item.onClick) {
                item.onClick();
              } else {
                onSectionChange(item.id);
              }
              setIsMobileOpen(false);
            }}
          >
            <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                )}
              </div>
            )}
            {!isCollapsed && item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-sm text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-20 left-4 z-50 lg:hidden bg-white shadow-md"
      >
        <Menu className="w-4 h-4" />
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden">
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 bg-white border-r border-gray-200 transition-all duration-300 z-30 hidden lg:block",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {sidebarContent}
      </div>
    </>
  );
};

export default DashboardSidebar;
