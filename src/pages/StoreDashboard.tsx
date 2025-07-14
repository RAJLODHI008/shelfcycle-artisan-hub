import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Package, AlertTriangle, TrendingDown, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function StoreDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalLots: 0,
    activeLots: 0,
    claimedLots: 0,
    wasteReduction: 0
  });
  const [recentLots, setRecentLots] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentLots();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: lots, error } = await supabase
        .from('lots')
        .select('status');
      
      if (error) throw error;

      const totalLots = lots.length;
      const activeLots = lots.filter(lot => lot.status === 'available').length;
      const claimedLots = lots.filter(lot => lot.status === 'claimed').length;
      
      setStats({
        totalLots,
        activeLots,
        claimedLots,
        wasteReduction: Math.round(totalLots * 2.5) // Estimated kg saved
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive"
      });
    }
  };

  const fetchRecentLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentLots(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recent lots",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'claimed': return 'bg-blue-500';
      case 'picked_up': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">ShelfCycle Store</h1>
                <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{profile?.role}</Badge>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/lots/create')}
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <PlusCircle className="h-8 w-8" />
              <span>Create New Lot</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/lots')}
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <Package className="h-8 w-8" />
              <span>Manage Lots</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <TrendingDown className="h-8 w-8" />
              <span>View Analytics</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Lots</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalLots}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Lots</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeLots}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Claimed Lots</p>
                  <p className="text-2xl font-bold text-foreground">{stats.claimedLots}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Waste Reduced</p>
                  <p className="text-2xl font-bold text-foreground">{stats.wasteReduction} kg</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lots */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lots</CardTitle>
            <CardDescription>Your latest flagged lots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLots.map((lot: any) => (
                <div key={lot.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(lot.status)}`} />
                    <div>
                      <p className="font-medium text-foreground">{lot.title}</p>
                      <p className="text-sm text-muted-foreground">{lot.category} • {lot.items_count} items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {lot.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(lot.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}