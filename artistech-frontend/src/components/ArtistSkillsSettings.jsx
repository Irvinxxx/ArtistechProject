import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const ArtistSkillsSettings = () => {
    const { token, user } = useContext(AuthContext);
    const [allSkills, setAllSkills] = useState([]);
    const [artistSkills, setArtistSkills] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllSkills = async () => {
            try {
                const response = await fetch('/api/skills');
                if (response.ok) {
                    const data = await response.json();
                    setAllSkills(data);
                }
            } catch (error) {
                toast.error("Could not load available skills.");
            }
        };

        const fetchArtistSkills = async () => {
            try {
                const response = await fetch(`/api/skills/artist/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    const skillsMap = data.reduce((acc, skill) => {
                        acc[skill.id] = skill.proficiency;
                        return acc;
                    }, {});
                    setArtistSkills(skillsMap);
                }
            } catch (error) {
                toast.error("Could not load your current skills.");
            }
        };

        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchAllSkills(), fetchArtistSkills()]);
            setIsLoading(false);
        };

        if (user) {
            loadData();
        }
    }, [user]);

    useEffect(() => {
        // Clean up artist skills that are no longer in the master list
        const allSkillIds = new Set(allSkills.map(s => s.id));
        setArtistSkills(prev => {
            const cleanedSkills = {};
            for (const skillId in prev) {
                if (allSkillIds.has(parseInt(skillId))) {
                    cleanedSkills[skillId] = prev[skillId];
                }
            }
            return cleanedSkills;
        });
    }, [allSkills]);

    const handleSkillToggle = (skillId) => {
        setArtistSkills(prev => {
            const newSkills = { ...prev };
            if (newSkills.hasOwnProperty(skillId)) {
                delete newSkills[skillId];
            } else {
                newSkills[skillId] = 'intermediate'; // Default proficiency
            }
            return newSkills;
        });
    };
    
    const handleProficiencyChange = (skillId, proficiency) => {
        setArtistSkills(prev => ({
            ...prev,
            [skillId]: proficiency
        }));
    };

    const handleSaveChanges = async () => {
        const allSkillIds = new Set(allSkills.map(s => s.id));
        const payload = {
            skills: Object.entries(artistSkills)
                .filter(([skill_id]) => allSkillIds.has(parseInt(skill_id)))
                .map(([skill_id, proficiency]) => ({
                    skill_id: parseInt(skill_id),
                    proficiency
                }))
        };
        
        try {
            const response = await fetch('/api/skills/artist', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                toast.success("Your skills have been updated successfully!");
            } else {
                throw new Error("Failed to update skills.");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (isLoading) {
        return <p>Loading skills settings...</p>;
    }
    
    const skillList = allSkills.filter(s => s.type === 'skill');
    const softwareList = allSkills.filter(s => s.type === 'software');
    
    const renderSkillSelector = (skill) => (
        <div key={skill.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
            <Checkbox 
                id={`skill-${skill.id}`} 
                checked={artistSkills.hasOwnProperty(skill.id)}
                onCheckedChange={() => handleSkillToggle(skill.id)}
            />
            <Label htmlFor={`skill-${skill.id}`} className="flex-grow">{skill.name}</Label>
            {artistSkills.hasOwnProperty(skill.id) && (
                <Select 
                    value={artistSkills[skill.id]}
                    onValueChange={(value) => handleProficiencyChange(skill.id, value)}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Proficiency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                </Select>
            )}
        </div>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Skills</CardTitle>
                <CardDescription>Select your skills and proficiency levels to attract the right clients.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Artistic Skills</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {skillList.map(renderSkillSelector)}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Software Proficiency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            {softwareList.map(renderSkillSelector)}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default ArtistSkillsSettings;
