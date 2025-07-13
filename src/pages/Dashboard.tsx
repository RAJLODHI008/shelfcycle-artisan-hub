import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, Package, Users, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'store_staff': return 'bg-blue-100 text-blue-800';
      case 'maker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDashboardContent = () => {
    switch (profile?.role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Manage the entire ShelfCycle ecosystem',
          cards: [
            { title: 'Total Lots', value: '1,234', icon: Package },
            { title: 'Active Makers', value: '89', icon: Users },
            { title: 'Waste Saved', value: '2.3T', icon: Recycle },
            { title: 'Success Rate', value: '94%', icon: BarChart3 }
          ]
        };
      case 'store_staff':
        return {
          title: 'Store Staff Dashboard',
          description: 'Manage store inventory and lot creation',
          cards: [
            { title: 'Active Lots', value: '23', icon: Package },
            { title: 'Pending Pickup', value: '7', icon: Users },
            { title: 'This Week', value: '156kg', icon: Recycle },
            { title: 'Claimed Rate', value: '87%', icon: BarChart3 }
          ]
        };
      case 'maker':
        return {
          title: 'Maker Portal',
          description: 'Find and claim lots for upcycling',
          cards: [
            { title: 'Available Lots', value: '42', icon: Package },
            { title: 'My Claims', value: '3', icon: Users },
            { title: 'Completed', value: '12', icon: Recycle },
            { title: 'Rating', value: profile.rating.toFixed(1), icon: BarChart3 }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to ShelfCycle',
          cards: []
        };
    }
  };

  const { title, description, cards } = getDashboardContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Recycle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ShelfCycle</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{profile?.full_name}</p>
              <Badge className={getRoleColor(profile?.role || '')}>
                {profile?.role?.replace('_', ' ')}
              </Badge>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-specific content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest ShelfCycle interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity to display.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for your role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile?.role === 'store_staff' && (
                <Button className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Create New Lot
                </Button>
              )}
              {profile?.role === 'maker' && (
                <Button className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Browse Available Lots
                </Button>
              )}
              {profile?.role === 'admin' && (
                <Button className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}