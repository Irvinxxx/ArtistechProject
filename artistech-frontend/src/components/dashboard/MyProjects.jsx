import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Eye, Calendar, DollarSign, User, FolderOpen } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const MyProjects = ({ projects, userType }) => {
  const getProjectProgress = (project) => {
    switch (project.status) {
      case 'awaiting_payment': return 0;
      case 'in_progress': return 10;
      case 'pending_progress_report': return 25;
      case 'pending_final_delivery': return 75;
      case 'pending_client_approval': return 90;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending_progress_report':
        return 'bg-orange-100 text-orange-800';
      case 'pending_final_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'pending_client_approval':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <p className="text-gray-600">
            {userType === 'artist' 
              ? 'Manage your active commission projects and track progress' 
              : 'View your commissioned projects and their status'
            }
          </p>
        </div>
        {userType === 'artist' && (
          <Link to="/commissions/browse">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Browse New Commissions
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FolderOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-4">
              {userType === 'artist' 
                ? "You haven't received any commission projects yet." 
                : "You haven't commissioned any projects yet."
              }
            </p>
            {userType === 'artist' ? (
              <Link to="/commissions/browse">
                <Button>Browse Commission Opportunities</Button>
              </Link>
            ) : (
              <Link to="/artists/search">
                <Button>Find Artists to Commission</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.commission_title || project.title || 'Untitled Project'}
                      </h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {project.description || 'No description available'}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>
                          {userType === 'artist' 
                            ? `Client: ${project.client_name || 'Unknown'}` 
                            : `Artist: ${project.artist_name || 'Unknown'}`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>{formatCurrency(project.final_price || project.budget)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {project.deadline 
                            ? `Due: ${formatDate(project.deadline)}` 
                            : 'No deadline'
                          }
                        </span>
                      </div>
                    </div>

                    {/* Project Progress Indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Status</span>
                        <span>{project.status?.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getProjectProgress(project)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    <Link to={`/project/${project.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    

                    
                    {project.status === 'awaiting_payment' && userType === 'client' && (
                      <Link to={`/commissions/checkout?projectId=${project.id}`}>
                        <Button size="sm" className="w-full">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProjects;
