import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, PlusCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import ProjectUpdateCard from './ProjectUpdateCard';

const ProjectUpdates = ({
  project,
  updates,
  onCreateUpdate,
  onSubmitUpdate,
  onApproveUpdate,
  onRequestRevision
}) => {
  const { user } = useContext(AuthContext);
  const isArtist = user?.user_type === 'artist';
  const isClient = user?.user_type === 'client';

  // Define the two required update types
  const requiredUpdates = [
    {
      type: 'progress_report',
      title: 'Progress Report',
      description: 'Required update at halfway point',
      dueDate: project.progress_deadline,
      isRequired: true
    },
    {
      type: 'final_delivery',
      title: 'Final Delivery',
      description: 'Final project delivery',
      dueDate: project.final_deadline,
      isRequired: false
    }
  ];

  const getStatusInfo = (status) => {
    const statuses = {
      'pending': { label: 'Pending', color: 'gray' },
      'submitted': { label: 'Submitted', color: 'blue' },
      'approved': { label: 'Approved', color: 'green' },
      'requires_revision': { label: 'Needs Revision', color: 'red' }
    };
    return statuses[status] || { label: status, color: 'gray' };
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
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Project Updates</span>
            <div className="flex items-center gap-2">
              <Badge className={`bg-${getStatusInfo(project.status).color}-100 text-${getStatusInfo(project.status).color}-800`}>
                {getStatusInfo(project.status).label}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requiredUpdates.map(update => {
              const existingUpdate = updates.find(u => u.update_type === update.type);

              return (
                <ProjectUpdateCard
                  key={update.type}
                  update={update}
                  project={project}
                  existingUpdate={existingUpdate}
                  isArtist={isArtist}
                  isClient={isClient}
                  onCreateUpdate={onCreateUpdate}
                  onSubmitUpdate={onSubmitUpdate}
                  onApproveUpdate={onApproveUpdate}
                  onRequestRevision={onRequestRevision}
                />
              );
            })}
          </div>

          {/* Progress Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Project Progress Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Progress Report:</span>
                <span className={`ml-2 ${updates.some(u => u.update_type === 'progress_report' && u.status === 'approved') ? 'text-green-600' : 'text-gray-600'}`}>
                  {updates.some(u => u.update_type === 'progress_report' && u.status === 'approved') ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Final Delivery:</span>
                <span className={`ml-2 ${updates.some(u => u.update_type === 'final_delivery' && u.status === 'approved') ? 'text-green-600' : 'text-gray-600'}`}>
                  {updates.some(u => u.update_type === 'final_delivery' && u.status === 'approved') ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectUpdates;
