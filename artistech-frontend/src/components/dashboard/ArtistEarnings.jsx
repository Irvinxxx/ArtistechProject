import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

const ArtistEarnings = () => {
    const { token } = useContext(AuthContext);
    const [earnings, setEarnings] = useState([]);
    const [summary, setSummary] = useState({
        pending_clearance: 0,
        available: 0,
        withdrawn: 0,
        total: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const response = await fetch('/api/user/earnings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch earnings data.');
                }
                const data = await response.json();
                setEarnings(data.earnings);
                setSummary(data.summary);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchEarnings();
        }
    }, [token]);
    
    const statusVariant = (status) => {
        switch (status) {
            case 'pending_clearance': return 'secondary';
            case 'cleared': return 'success';
            case 'paid_out': return 'outline';
            default: return 'default';
        }
    }

    if (loading) {
        return <Skeleton className="h-96 w-full" />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader><CardTitle>Pending Clearance</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(summary.pending_clearance)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Available for Withdrawal</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(summary.available)}</p></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Total Withdrawn</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(summary.withdrawn)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Lifetime Earnings</CardTitle></CardHeader>
                    <CardContent><p className="text-2xl font-bold">{formatCurrency(summary.total)}</p></CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Earnings History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Artwork/Order</TableHead>
                                <TableHead>Sale Amount</TableHead>
                                <TableHead>Platform Fee</TableHead>
                                <TableHead>Net Earning</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earnings.length > 0 ? (
                                earnings.map((earning) => (
                                    <TableRow key={earning.id}>
                                        <TableCell>{new Date(earning.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {earning.source_type === 'artwork_sale' ? 'Artwork Sale' : 'Commission'}: #{earning.source_id}
                                        </TableCell>
                                        <TableCell>{formatCurrency(earning.amount)}</TableCell>
                                        <TableCell className="text-red-500">-{formatCurrency(earning.platform_fee)}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(earning.net_amount)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(earning.status)}>
                                                {earning.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="6" className="text-center">No earnings records found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ArtistEarnings;
