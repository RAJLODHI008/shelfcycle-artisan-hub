import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Shield, TrendingUp, Users, Package, BarChart, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalLots: 0,
    totalClaims: 0,
    totalMakers: 0,
    totalStores: 0,
    wasteReduction: 0,
    avgRating: 0
  });
  const [makers, setMakers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMakers();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const [lotsRes, claimsRes, profilesRes] = await Promise.all([
        supabase.from('lots').select('id'),
        supabase.from('claims').select('id'),
        supabase.from('profiles').select('role, rating')
      ]);

      const totalLots = lotsRes.data?.length || 0;
      const totalClaims = claimsRes.data?.length || 0;
      const profiles = profilesRes.data || [];
      
      const makers = profiles.filter(p => p.role === 'maker');
      const stores = profiles.filter(p => p.role === 'store_staff');
      const avgRating = makers.length > 0 
        ? makers.reduce((sum, m) => sum + (Number(m.rating) || 0), 0) / makers.length
        : 0;

      setStats({
        totalLots,
        totalClaims,
        totalMakers: makers.length,
        totalStores: stores.length,
        wasteReduction: Math.round(totalLots * 2.5),
        avgRating
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics",
        variant: "destructive"
      });
    }
  };

  const fetchMakers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'maker')
        .order('rating', { ascending: false });
      
      if (error) throw error;
      setMakers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch makers",
        variant: "destructive"
      });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          lots (title, category),
          profiles!claims_maker_id_fkey (full_name)
        `)
        .order('claimed_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch recent activity",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-orange-500';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const formatRating = (rating: number) => {
    return Number(rating).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
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
        {/* Platform Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalClaims}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Makers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalMakers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partner Stores</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalStores}</p>
                </div>
                <BarChart className="h-8 w-8 text-purple-500" />
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
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold text-foreground">{formatRating(stats.avgRating)}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="makers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="makers">Maker Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="makers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maker Performance</CardTitle>
                <CardDescription>Monitor and manage maker ratings and tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {makers.map((maker: any) => (
                    <div key={maker.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getTierColor(maker.maker_tier)}`} />
                        <div>
                          <p className="font-medium text-foreground">{maker.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {maker.total_claims || 0} claims • {maker.successful_returns || 0} returns
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-foreground">{formatRating(maker.rating || 0)}</p>
                          <div className="w-24">
                            <Progress value={(maker.rating || 0) * 20} />
                          </div>
                        </div>
                        <Badge className={getTierColor(maker.maker_tier || 'bronze')}>
                          {(maker.maker_tier || 'bronze').toUpperCase()}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>Track user adoption and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Maker Adoption</span>
                      <span className="font-medium">{stats.totalMakers}</span>
                    </div>
                    <Progress value={(stats.totalMakers / 100) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Store Partnership</span>
                      <span className="font-medium">{stats.totalStores}</span>
                    </div>
                    <Progress value={(stats.totalStores / 50) * 100} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Claim Rate</span>
                      <span className="font-medium">{Math.round((stats.totalClaims / Math.max(stats.totalLots, 1)) * 100)}%</span>
                    </div>
                    <Progress value={(stats.totalClaims / Math.max(stats.totalLots, 1)) * 100} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                  <CardDescription>Waste reduction metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">{stats.wasteReduction} kg</p>
                      <p className="text-sm text-muted-foreground">Total waste diverted</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-500">{Math.round(stats.wasteReduction * 2.1)} kg CO₂</p>
                      <p className="text-sm text-muted-foreground">CO₂ emissions prevented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
                <CardDescription>Latest claims and platform actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            {activity.profiles?.full_name} claimed "{activity.lots?.title}"
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.lots?.category} • {new Date(activity.claimed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {activity.returned_at ? 'Completed' : 
                         activity.picked_up_at ? 'Picked Up' : 
                         activity.pickup_scheduled_at ? 'Scheduled' : 'Claimed'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}