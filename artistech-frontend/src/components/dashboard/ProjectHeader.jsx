import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ProjectHeader = ({ project }) => {
    if (!project) return null;

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{project.commission_title}</h1>
                        <p className="text-sm text-muted-foreground">Project Overview</p>
                    </div>
                    <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                        {project.status.replace('_', ' ')}
                    </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-4 text-sm">
                     <div className="flex items-center">
                        <span className="font-semibold mr-2">Client:</span>
                        <span>{project.client_name}</span>
                    </div>
                    <div className="flex items-center">
                         <span className="font-semibold mr-2">Artist:</span>
                        <span>{project.artist_name}</span>
                    </div>
                    <div className="flex items-center">
                         <span className="font-semibold mr-2">Total Price:</span>
                        <span className="font-bold">PHP {project.final_price}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProjectHeader;
