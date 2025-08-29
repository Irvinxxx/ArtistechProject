import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FileText, PlusCircle, Upload, CheckCircle, XCircle, Edit } from 'lucide-react';

const ProjectUpdateCard = ({
  update,
  project,
  existingUpdate,
  isArtist,
  isClient,
  onCreateUpdate,
  onSubmitUpdate,
  onApproveUpdate,
  onRequestRevision
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUpdateData, setNewUpdateData] = useState({
    title: update.title,
    description: update.description,
    files: []
  });

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

  const canCreateUpdate = isArtist && !existingUpdate;
  const canSubmitUpdate = isArtist && existingUpdate && existingUpdate.status === 'pending';
  const canApproveUpdate = isClient && existingUpdate && existingUpdate.status === 'submitted';

  const handleCreateUpdate = () => {
    onCreateUpdate(update.type, newUpdateData);
    setIsCreateDialogOpen(false);
    setNewUpdateData({
      title: update.title,
      description: update.description,
      files: []
    });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setNewUpdateData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-grow">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {update.title}
              {update.isRequired && (
                <Badge variant="outline" className="text-xs">
                  Required
                </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {update.description}
            </p>
            <div className="flex items-center text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Due: {formatDate(update.dueDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {existingUpdate && (
              <Badge className={`bg-${getStatusInfo(existingUpdate.status).color}-100 text-${getStatusInfo(existingUpdate.status).color}-800`}>
                {getStatusInfo(existingUpdate.status).label}
              </Badge>
            )}

            {canCreateUpdate && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create {update.title}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={newUpdateData.title}
                        onChange={(e) => setNewUpdateData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter update title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newUpdateData.description}
                        onChange={(e) => setNewUpdateData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your progress or final delivery"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Files (optional)</label>
                      <div className="mt-2">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id={`file-upload-${update.type}`}
                        />
                        <label
                          htmlFor={`file-upload-${update.type}`}
                          className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                        >
                          <Upload className="w-6 h-6 mr-2" />
                          <span className="text-sm">Click to upload files</span>
                        </label>
                        {newUpdateData.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {newUpdateData.files.map((file, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                {file.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUpdate}>
                        Create Update
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {canSubmitUpdate && (
              <Button onClick={() => onSubmitUpdate(existingUpdate.id)}>
                Submit for Review
              </Button>
            )}

            {canApproveUpdate && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onApproveUpdate(existingUpdate.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onRequestRevision(existingUpdate.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Request Revision
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {existingUpdate && (
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">{existingUpdate.title}</h4>
              <p className="text-sm text-muted-foreground">{existingUpdate.description}</p>
            </div>

            {existingUpdate.files && existingUpdate.files.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Attached Files:</h5>
                <div className="flex flex-wrap gap-2">
                  {existingUpdate.files.map((file, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Created: {new Date(existingUpdate.created_at).toLocaleDateString()}
              {existingUpdate.updated_at !== existingUpdate.created_at &&
                ` | Updated: ${new Date(existingUpdate.updated_at).toLocaleDateString()}`
              }
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProjectUpdateCard;
