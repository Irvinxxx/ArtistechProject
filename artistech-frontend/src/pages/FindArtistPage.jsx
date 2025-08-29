import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArtworkImage from '../components/ui/artwork-image'; // Import ArtworkImage

const FindArtistPage = () => {
    const [artists, setArtists] = useState([]);
    const [allSkills, setAllSkills] = useState({ skills: [], software: [] });
    const [filters, setFilters] = useState({
        query: '',
        skills: [],
        software: [],
        minPrice: '',
        maxPrice: '',
        availability: '',
        minRating: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all available skills for filter options
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await fetch('/api/skills');
                const data = await response.json();
                setAllSkills({
                    skills: data.filter(s => s.type === 'skill'),
                    software: data.filter(s => s.type === 'software')
                });
            } catch (error) {
                toast.error("Could not load filter options.");
            }
        };
        fetchSkills();
    }, []);
    
    // Fetch artists based on filters
    useEffect(() => {
        const fetchArtists = async () => {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (filters.query) params.append('query', filters.query);
            if (filters.skills.length) params.append('skills', filters.skills.join(','));
            if (filters.software.length) params.append('software', filters.software.join(','));
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.availability) params.append('availability', filters.availability);
            if (filters.minRating) params.append('minRating', filters.minRating);

            try {
                const response = await fetch(`/api/artists/search?${params.toString()}`);
                const data = await response.json();
                setArtists(data);
            } catch (error) {
                toast.error("Failed to search for artists.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchArtists();
    }, [filters]);
    
    const handleFilterChange = (type, value) => {
        setFilters(prev => ({...prev, [type]: value}));
    };
    
    const handleCheckboxChange = (type, itemName) => {
        const currentItems = filters[type];
        const newItems = currentItems.includes(itemName)
            ? currentItems.filter(item => item !== itemName)
            : [...currentItems, itemName];
        handleFilterChange(type, newItems);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Find an Artist</h1>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Card>
                        <CardContent className="p-4 space-y-6">
                            <Input placeholder="Search by name..." value={filters.query} onChange={e => handleFilterChange('query', e.target.value)} />
                            
                            <div>
                                <h3 className="font-semibold mb-2">Availability</h3>
                                <Select 
                                    value={filters.availability} 
                                    onValueChange={value => handleFilterChange('availability', value === 'any' ? '' : value)}
                                >
                                    <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Limited">Limited</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Price Range (PHP)</h3>
                                <div className="flex space-x-2">
                                    <Input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={filters.minPrice} 
                                        onChange={e => handleFilterChange('minPrice', e.target.value)} 
                                    />
                                    <Input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={filters.maxPrice} 
                                        onChange={e => handleFilterChange('maxPrice', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Skills</h3>
                                <div className="space-y-2">
                                    {allSkills.skills.map(skill => (
                                        <div key={skill.id} className="flex items-center space-x-2">
                                            <Checkbox id={`skill-${skill.id}`} onCheckedChange={() => handleCheckboxChange('skills', skill.name)} />
                                            <Label htmlFor={`skill-${skill.id}`}>{skill.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             <div>
                                <h3 className="font-semibold mb-2">Software</h3>
                                <div className="space-y-2">
                                    {allSkills.software.map(sw => (
                                        <div key={sw.id} className="flex items-center space-x-2">
                                            <Checkbox id={`sw-${sw.id}`} onCheckedChange={() => handleCheckboxChange('software', sw.name)} />
                                            <Label htmlFor={`sw-${sw.id}`}>{sw.name}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Artist Results */}
                <main className="lg:col-span-3">
                    {isLoading ? <p>Loading artists...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {artists.map(artist => (
                                <Card key={artist.id}>
                                    <CardContent className="p-4 flex items-start space-x-4">
                                        <ArtworkImage 
                                            src={artist.profile_image} 
                                            alt={artist.name} 
                                            className="w-24 h-24 rounded-full" 
                                            fallbackText="Artist"
                                            showWatermark={false}
                                            protectionLevel="medium"
                                        />
                                        <div className="flex-grow">
                                            <Link to={`/artists/${artist.id}`} className="font-bold text-lg hover:underline">{artist.name}</Link>
                                            <p className="text-sm text-gray-600">{artist.location}</p>
                                            <p className="text-sm my-2 line-clamp-2">{artist.bio}</p>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span>{parseFloat(artist.average_rating).toFixed(1) || 'N/A'}</span>
                                            </div>
                                            <Button asChild className="mt-2" size="sm">
                                                <Link to={`/artists/${artist.id}`}>View Profile</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FindArtistPage;
