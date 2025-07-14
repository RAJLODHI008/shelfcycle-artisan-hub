import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Star, Package, Clock, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function MakerPortal() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [availableLots, setAvailableLots] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [stats, setStats] = useState({
    totalClaims: 0,
    successfulReturns: 0,
    rating: 0,
    tier: 'bronze'
  });

  useEffect(() => {
    fetchAvailableLots();
    fetchMyClaims();
    fetchStats();
  }, []);

  const fetchAvailableLots = async () => {
    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAvailableLots(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch available lots",
        variant: "destructive"
      });
    }
  };

  const fetchMyClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          lots (*)
        `)
        .eq('maker_id', profile?.user_id)
        .order('claimed_at', { ascending: false });
      
      if (error) throw error;
      setMyClaims(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your claims",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    if (!profile) return;
    
    setStats({
      totalClaims: profile.total_claims || 0,
      successfulReturns: profile.successful_returns || 0,
      rating: Number(profile.rating) || 0,
      tier: profile.maker_tier || 'bronze'
    });
  };

  const handleClaimLot = async (lotId: string) => {
    try {
      const { error } = await supabase
        .from('claims')
        .insert({
          lot_id: lotId,
          maker_id: profile?.user_id
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Lot claimed successfully!"
      });
      
      fetchAvailableLots();
      fetchMyClaims();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim lot",
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

  const getClaimStatus = (claim: any) => {
    if (claim.returned_at) return 'completed';
    if (claim.picked_up_at) return 'picked_up';
    if (claim.pickup_scheduled_at) return 'scheduled';
    return 'claimed';
  };

  const filteredLots = availableLots.filter((lot: any) =>
    lot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Star className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Maker Portal</h1>
                <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getTierColor(stats.tier)}>
                {stats.tier.toUpperCase()} MAKER
              </Badge>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Claims</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalClaims}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Successful Returns</p>
                  <p className="text-2xl font-bold text-foreground">{stats.successfulReturns}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold text-foreground">{stats.rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maker Tier</p>
                  <p className="text-2xl font-bold text-foreground">{stats.tier}</p>
                </div>
                <div className={`h-8 w-8 rounded-full ${getTierColor(stats.tier)}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available Lots</TabsTrigger>
            <TabsTrigger value="claims">My Claims</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Lots</CardTitle>
                <CardDescription>Browse and claim available lots from stores</CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search lots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLots.map((lot: any) => (
                    <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{lot.title}</h3>
                            <p className="text-sm text-muted-foreground">{lot.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{lot.category}</Badge>
                            <span className="text-sm text-muted-foreground">{lot.items_count} items</span>
                          </div>
                          
                          {lot.estimated_weight_kg && (
                            <p className="text-sm text-muted-foreground">
                              Est. weight: {lot.estimated_weight_kg} kg
                            </p>
                          )}
                          
                          {lot.expiry_date && (
                            <p className="text-sm text-muted-foreground">
                              Expires: {new Date(lot.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>Store: {lot.store_id}</span>
                          </div>
                          
                          <Button 
                            onClick={() => handleClaimLot(lot.id)}
                            className="w-full"
                          >
                            Claim Lot
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="claims" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Claims</CardTitle>
                <CardDescription>Track your claimed lots and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myClaims.map((claim: any) => (
                    <div key={claim.id} className="border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">{claim.lots?.title}</h3>
                          <p className="text-sm text-muted-foreground">{claim.lots?.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{claim.lots?.category}</span>
                            <span>{claim.lots?.items_count} items</span>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {getClaimStatus(claim).replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Claimed</p>
                            <p className="font-medium">{new Date(claim.claimed_at).toLocaleDateString()}</p>
                          </div>
                          {claim.pickup_scheduled_at && (
                            <div>
                              <p className="text-muted-foreground">Pickup Scheduled</p>
                              <p className="font-medium">{new Date(claim.pickup_scheduled_at).toLocaleDateString()}</p>
                            </div>
                          )}
                          {claim.picked_up_at && (
                            <div>
                              <p className="text-muted-foreground">Picked Up</p>
                              <p className="font-medium">{new Date(claim.picked_up_at).toLocaleDateString()}</p>
                            </div>
                          )}
                          {claim.returned_at && (
                            <div>
                              <p className="text-muted-foreground">Returned</p>
                              <p className="font-medium">{new Date(claim.returned_at).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        
                        {claim.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">Notes: {claim.notes}</p>
                          </div>
                        )}
                      </div>
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