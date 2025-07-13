import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Recycle, Package, Users, ArrowRight, Leaf, Award } from 'lucide-react';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Recycle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">ShelfCycle</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Circular Economy Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connecting near-expiry and imperfect items with local artisans who transform them into valuable upcycled products. 
            Reduce waste, support local makers, create new revenue streams.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Join as Maker
              <Recycle className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Store Access
              <Package className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Package className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Store Integration</CardTitle>
              <CardDescription>
                Flag near-expiry and imperfect items for upcycling instead of disposal
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Maker Network</CardTitle>
              <CardDescription>
                Connect with verified local artisans and upcycling specialists
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Leaf className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Sustainability Impact</CardTitle>
              <CardDescription>
                Track waste reduction and environmental benefits in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Impact Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">2.3T</div>
              <p className="text-muted-foreground">Waste Diverted</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,250+</div>
              <p className="text-muted-foreground">Active Makers</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">94%</div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
              <CardDescription className="text-lg">
                Join the circular economy revolution. Transform waste into opportunity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" className="w-full" onClick={() => navigate('/auth')}>
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
