import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Calendar, DollarSign, User, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

import ProjectHeader from '../components/dashboard/ProjectHeader';
import ProjectUpdates from '../components/dashboard/ProjectUpdates';

const SimpleProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const socket = useSocket();

  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectData = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        toast.error('Failed to fetch project details.');
        navigate('/dashboard');
        return;
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      toast.error('An error occurred while fetching project data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId, token, navigate]);

  const fetchProjectUpdates = useCallback(async () => {
    try {
      const response = await fetch(`/api/project-updates/${projectId}/updates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error fetching project updates:', error);
    }
  }, [projectId, token]);

  useEffect(() => {
    fetchProjectData();
    fetchProjectUpdates();
  }, [fetchProjectData, fetchProjectUpdates]);

  useEffect(() => {
    if (!socket || !projectId) return;

    const room = `project-${projectId}`;
    socket.emit('join_project_room', room);

    // Listen for project update events
    const handleProjectUpdate = (updateData) => {
      setUpdates(prev => {
        const existingIndex = prev.findIndex(u => u.id === updateData.id);
        if (existingIndex >= 0) {
          const newUpdates = [...prev];
          newUpdates[existingIndex] = updateData;
          return newUpdates;
        } else {
          return [...prev, updateData];
        }
      });

      // Refresh project data to get updated status
      fetchProjectData();
    };

    socket.on('project_update_created', handleProjectUpdate);
    socket.on('project_update_updated', handleProjectUpdate);

    return () => {
      socket.off('project_update_created', handleProjectUpdate);
      socket.off('project_update_updated', handleProjectUpdate);
    };
  }, [socket, projectId, fetchProjectData]);

  const handleCreateUpdate = async (updateType, updateData) => {
    try {
      const response = await fetch(`/api/project-updates/${projectId}/updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          updateType,
          ...updateData
        })
      });

      if (response.ok) {
        toast.success('Update created successfully!');
        fetchProjectUpdates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create update');
      }
    } catch (error) {
      toast.error('An error occurred while creating the update');
      console.error(error);
    }
  };

  const handleSubmitUpdate = async (updateId) => {
    try {
      const response = await fetch(`/api/project-updates/updates/${updateId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'submitted' })
      });

      if (response.ok) {
        toast.success('Update submitted for review!');
        fetchProjectUpdates();
        fetchProjectData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit update');
      }
    } catch (error) {
      toast.error('An error occurred while submitting the update');
      console.error(error);
    }
  };

  const handleApproveUpdate = async (updateId) => {
    try {
      const response = await fetch(`/api/project-updates/updates/${updateId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (response.ok) {
        toast.success('Update approved!');
        fetchProjectUpdates();
        fetchProjectData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to approve update');
      }
    } catch (error) {
      toast.error('An error occurred while approving the update');
      console.error(error);
    }
  };

  const handleRequestRevision = async (updateId) => {
    try {
      const response = await fetch(`/api/project-updates/updates/${updateId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'requires_revision' })
      });

      if (response.ok) {
        toast.success('Revision requested!');
        fetchProjectUpdates();
        fetchProjectData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to request revision');
      }
    } catch (error) {
      toast.error('An error occurred while requesting revision');
      console.error(error);
    }
  };

  const handleFinalPayment = async () => {
    if (!project) return;

    try {
      // Navigate to checkout with project information
      navigate(`/commissions/checkout?projectId=${projectId}`);
    } catch (error) {
      toast.error('An error occurred while processing payment');
      console.error(error);
    }
  };

  const getStatusInfo = (status) => {
    const statuses = {
      'awaiting_payment': { label: 'Awaiting Payment', color: 'yellow', progress: 0 },
      'in_progress': { label: 'In Progress', color: 'blue', progress: 25 },
      'pending_progress_report': { label: 'Waiting for Progress Report', color: 'orange', progress: 50 },
      'pending_final_delivery': { label: 'Waiting for Final Delivery', color: 'purple', progress: 75 },
      'pending_client_approval': { label: 'Waiting for Your Approval', color: 'indigo', progress: 90 },
      'completed': { label: 'Completed', color: 'green', progress: 100 },
      'cancelled': { label: 'Cancelled', color: 'red', progress: 0 }
    };
    return statuses[status] || { label: status, color: 'gray', progress: 0 };
  };

  const getProjectProgress = () => {
    if (!project || !updates) return 0;

    const progressReportApproved = updates.some(u => u.update_type === 'progress_report' && u.status === 'approved');
    const finalDeliveryApproved = updates.some(u => u.update_type === 'final_delivery' && u.status === 'approved');

    if (project.status === 'completed') return 100;
    if (project.status === 'pending_client_approval') return 90;
    if (finalDeliveryApproved) return 85;
    if (project.status === 'pending_final_delivery') return 75;
    if (progressReportApproved) return 50;
    if (project.status === 'pending_progress_report') return 25;
    if (project.status === 'in_progress') return 10;
    return 0;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading project...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p>Project not found or access denied.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(project.status);
  const progress = getProjectProgress();
  const isArtist = user?.user_type === 'artist';
  const isClient = user?.user_type === 'client';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Project Header */}
      <ProjectHeader project={project} />

      {/* Project Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Project Progress</span>
            <Badge className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
              {statusInfo.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(project.final_price)}
                </div>
                <div className="text-sm text-muted-foreground">Project Value</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {updates.filter(u => u.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Updates</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Updates */}
      <ProjectUpdates
        project={project}
        updates={updates}
        onCreateUpdate={handleCreateUpdate}
        onSubmitUpdate={handleSubmitUpdate}
        onApproveUpdate={handleApproveUpdate}
        onRequestRevision={handleRequestRevision}
      />

      {/* Communication Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Project Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Use the chat system to communicate with the {isArtist ? 'client' : 'artist'} about project details,
            clarifications, and ongoing discussions.
          </p>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Chat
          </Button>
        </CardContent>
      </Card>

      {/* Payment Section - Only show for clients when project is ready for payment */}
      {isClient && project.status === 'pending_client_approval' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Ready for Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-4">
              The final delivery has been approved! You can now complete the payment to release funds to the artist.
            </p>
            <Button
              onClick={handleFinalPayment}
              className="bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Pay {formatCurrency(project.final_price)} & Complete Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Completion Message */}
      {project.status === 'completed' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">Project Completed!</h3>
            <p className="text-green-700">
              This project has been successfully completed. The artist has received payment and the final deliverables are available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleProjectPage;
