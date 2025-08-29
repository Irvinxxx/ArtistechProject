import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

import ProjectHeader from '../components/dashboard/ProjectHeader';
import MilestoneList from '../components/dashboard/MilestoneList';
import AddEditMilestoneModal from '../components/dashboard/AddEditMilestoneModal';

const CommissionProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const socket = useSocket();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMilestone, setEditingMilestone] = useState(null);

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

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    useEffect(() => {
        if (!socket || !projectId) return;

        const room = `project-${projectId}`;
        socket.emit('join_project_room', room);

        const updateProjectState = (updateLogic) => {
            setProject(prevProject => {
                if (!prevProject) return null;
                return updateLogic(JSON.parse(JSON.stringify(prevProject)));
            });
        };

        const handleMilestoneCreated = (newMilestone) => updateProjectState(draft => {
            draft.milestones.push(newMilestone);
            return draft;
        });
        
        const handleMilestoneUpdated = (updatedMilestone) => {
            console.log('Received milestone_updated event with:', updatedMilestone); // DEBUG LOG
            updateProjectState(draft => {
                const index = draft.milestones.findIndex(m => m.id === updatedMilestone.id);
                if (index !== -1) {
                    draft.milestones[index] = updatedMilestone;
                } else {
                    console.warn('Milestone to update not found in state:', updatedMilestone.id);
                }
                return draft;
            });
        };

        const handleMilestoneDeleted = ({ milestoneId }) => updateProjectState(draft => {
            draft.milestones = draft.milestones.filter(m => m.id !== milestoneId);
            return draft;
        });

        const handleMilestoneStatusUpdated = ({ milestoneId, status }) => updateProjectState(draft => {
            const milestone = draft.milestones.find(m => m.id === milestoneId);
            if (milestone) milestone.status = status;
            return draft;
        });

        const handleDeliveryAdded = (deliveryData) => updateProjectState(draft => {
            const milestone = draft.milestones.find(m => m.id === deliveryData.milestone_id);
            if (milestone) {
                if (!milestone.deliveries) milestone.deliveries = [];
                milestone.deliveries.push(deliveryData);
            }
            return draft;
        });
        
        const handleMilestonePaid = ({ milestoneId }) => updateProjectState(draft => {
             const milestone = draft.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.is_paid = 1;
                milestone.status = 'completed';
            }
            return draft;
        });

        socket.on('milestone_created', handleMilestoneCreated);
        socket.on('milestone_updated', handleMilestoneUpdated);
        socket.on('milestone_deleted', handleMilestoneDeleted);
        socket.on('milestone_status_updated', handleMilestoneStatusUpdated);
        socket.on('delivery_added', handleDeliveryAdded);
        socket.on('milestone_paid', handleMilestonePaid);

        return () => {
            socket.emit('leave_project_room', room);
            socket.off('milestone_created', handleMilestoneCreated);
            socket.off('milestone_updated', handleMilestoneUpdated);
            socket.off('milestone_deleted', handleMilestoneDeleted);
            socket.off('milestone_status_updated', handleMilestoneStatusUpdated);
            socket.off('delivery_added', handleDeliveryAdded);
            socket.off('milestone_paid', handleMilestonePaid);
        };
    }, [socket, projectId]);


    const handleSaveMilestone = async (milestoneData) => {
        const url = editingMilestone
            ? `/api/projects/milestones/${editingMilestone.id}`
            : `/api/projects/${projectId}/milestones`;
        const method = editingMilestone ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(milestoneData),
            });
            if (!response.ok) throw new Error('Failed to save milestone.');
            
            toast.success(`Milestone ${editingMilestone ? 'updated' : 'created'} successfully!`);
            // No need to fetch, socket event will update state
            setIsModalOpen(false);
            setEditingMilestone(null);
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handleDeleteMilestone = async (milestoneId) => {
        if (!window.confirm('Are you sure you want to delete this milestone? This cannot be undone.')) return;

        try {
            const response = await fetch(`/api/projects/milestones/${milestoneId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete milestone.');
            toast.success('Milestone deleted successfully.');
            // No need to manually update state here, socket event will handle it
        } catch (error) {
            console.error('Error deleting milestone:', error);
            const errorMessage = error.response?.data?.error || 'Failed to delete milestone. Please try again.';
            toast.error(errorMessage);
        }
    };

    const handleStatusUpdate = async (milestoneId, status) => {
        try {
            const response = await fetch(`/api/projects/milestones/${milestoneId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update status.');
            toast.success('Milestone status updated.');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleFileUpload = async (milestoneId, file) => {
        const formData = new FormData();
        formData.append('deliveryFile', file);
        try {
            const response = await fetch(`/api/projects/milestones/${milestoneId}/deliveries`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (!response.ok) throw new Error('File upload failed.');
            toast.success('File uploaded successfully.');
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handlePayment = async (milestoneId) => {
        try {
            const response = await fetch(`/api/projects/milestones/${milestoneId}/pay`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
             if (!response.ok) throw new Error('Payment failed.');
            toast.success('Payment successful!');
        } catch(error) {
             toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 lg:p-6">
                <Skeleton className="h-24 w-full mb-6" />
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }
    
    if(!project) {
        return <div className="container mx-auto p-4 text-center">Project not found or you do not have permission to view it.</div>
    }

    const otherUserId = user.id === project.client_id ? project.artist_id : project.client_id;

    return (
        <div className="container mx-auto p-4 lg:p-6">
            <ProjectHeader project={project} />

            <div className="mt-6">
                <MilestoneList
                    milestones={project.milestones}
                    project={project}
                    onStatusUpdate={handleStatusUpdate}
                    onPayment={handlePayment}
                    onEditMilestone={(milestone) => {
                        setEditingMilestone(milestone);
                        setIsModalOpen(true);
                    }}
                    onDeleteMilestone={handleDeleteMilestone}
                    onFileUpload={handleFileUpload}
                    onAddMilestone={() => {
                        setEditingMilestone(null);
                        setIsModalOpen(true);
                    }}
                />
            </div>
            
            <div className="fixed bottom-6 right-6">
                <Button asChild>
                    <Link to={`/messages/${otherUserId}?projectId=${projectId}`}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Open Conversation
                    </Link>
                </Button>
            </div>

            <AddEditMilestoneModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSaveMilestone}
                milestone={editingMilestone}
            />
        </div>
    );
};

export default CommissionProjectPage;
