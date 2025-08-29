import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

const SalesHistory = () => {
  const { token } = useContext(AuthContext);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/orders/artist/sales', { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setSales(data);
        } else {
          throw new Error('Failed to fetch sales history');
        }
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
    };
    if (token) fetchSales();
  }, [token]);

  if (loading) return <p>Loading sales history...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sales.length === 0 ? (
          <p>You have no completed sales yet.</p>
        ) : (
          sales.map(sale => (
            <div key={sale.id} className="border p-4 rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{sale.title}</p>
                  <p className="text-sm text-gray-500">Order #{sale.id} - Sold for {formatCurrency(sale.price)}</p>
                </div>
                <Badge>{sale.status}</Badge>
              </div>
               <div className="text-sm text-gray-600 space-y-1">
                 <p><strong>Buyer:</strong> {sale.buyer_name}</p>
                 <p><strong>Purchase Date:</strong> {sale.purchase_date ? new Date(sale.purchase_date).toLocaleDateString() : 'N/A'}</p>
                 <p><strong>Delivery:</strong> Instant Digital Download</p>
                 <p><strong>Type:</strong> Digital Art</p>
               </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SalesHistory;
