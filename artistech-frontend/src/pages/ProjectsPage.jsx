import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!token || !user) {
                setLoading(false);
                return;
            }
            
            // Determine the correct API endpoint based on user role
            const endpoint = user.user_type === 'artist' ? '/api/projects/artist' : '/api/projects/client';

            try {
                const response = await fetch(endpoint, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                setProjects(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [token, user]);

    if (loading) {
        return <div className="container mx-auto p-4">Loading projects...</div>;
    }

    return (
        <div className="container mx-auto p-4 lg:p-6">
            <h1 className="text-3xl font-bold mb-6">My Projects</h1>
            {projects.length === 0 ? (
                <p>You do not have any active projects at the moment.</p>
            ) : (
                <div className="space-y-4">
                    {projects.map(project => (
                        <Card key={project.id}>
                            <CardContent className="pt-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">{project.commission_title}</h2>
                                    <p className="text-sm text-muted-foreground">
                                        {user.user_type === 'artist' ? `Client: ${project.client_name}` : `Artist: ${project.artist_name}`}
                                        <span className="mx-2">|</span>
                                        Status: <span className="capitalize">{project.status}</span>
                                    </p>
                                </div>
                                <Button asChild variant="outline">
                                    <Link to={`/project/${project.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Project
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
