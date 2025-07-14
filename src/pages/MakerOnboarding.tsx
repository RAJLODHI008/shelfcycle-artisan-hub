import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Upload, FileText, User, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function MakerOnboarding() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    kycDocument: null as File | null,
    agreedToTerms: false
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Check if user is already verified
    if (profile?.kyc_verified) {
      navigate('/maker-portal');
    }
  }, [profile, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (file: File) => {
    setFormData(prev => ({
      ...prev,
      kycDocument: file
    }));
  };

  const handleStepSubmit = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      await handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: formData.phone,
          address: formData.address,
          kyc_verified: true // In real app, this would be false until admin approval
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "KYC verification submitted successfully!"
      });

      navigate('/maker-portal');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit KYC verification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Provide your contact details for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>KYC Documentation</span>
              </CardTitle>
              <CardDescription>Upload identity verification documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a clear photo of your government-issued ID
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="hidden"
                  id="kyc-upload"
                />
                <label htmlFor="kyc-upload">
                  <Button variant="outline" asChild>
                    <span>Select File</span>
                  </Button>
                </label>
                {formData.kycDocument && (
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{formData.kycDocument.name}</span>
                  </div>
                )}
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Accepted Documents:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Driver's License</li>
                  <li>• Passport</li>
                  <li>• National ID Card</li>
                  <li>• State ID</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Terms & Verification</span>
              </CardTitle>
              <CardDescription>Review and accept our terms of service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Maker Agreement Summary:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Commit to timely pickup of claimed lots</li>
                  <li>• Return products in sellable condition when possible</li>
                  <li>• Maintain high standards of food safety</li>
                  <li>• Provide honest feedback and documentation</li>
                  <li>• Respect store policies and procedures</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.agreedToTerms}
                    onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the ShelfCycle Maker Terms of Service and Privacy Policy
                  </Label>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Next Steps:</strong> After submission, our team will review your application 
                  within 2-3 business days. You'll receive an email confirmation once approved.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Maker Onboarding</h1>
          <p className="text-muted-foreground">Complete your verification to start claiming lots</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Button
            onClick={handleStepSubmit}
            disabled={
              isLoading ||
              (currentStep === 1 && (!formData.phone || !formData.address)) ||
              (currentStep === 2 && !formData.kycDocument) ||
              (currentStep === 3 && !formData.agreedToTerms)
            }
          >
            {isLoading ? 'Submitting...' : currentStep === totalSteps ? 'Submit Application' : 'Next'}
          </Button>
        </div>

        {/* Tier Information */}
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
          <h3 className="font-semibold text-foreground mb-2">Maker Tier System</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge className="bg-orange-500 mb-2">BRONZE</Badge>
              <p className="text-xs text-muted-foreground">Starting tier for new makers</p>
            </div>
            <div className="text-center">
              <Badge className="bg-gray-400 mb-2">SILVER</Badge>
              <p className="text-xs text-muted-foreground">10+ successful claims</p>
            </div>
            <div className="text-center">
              <Badge className="bg-yellow-500 mb-2">GOLD</Badge>
              <p className="text-xs text-muted-foreground">50+ claims, 4.5+ rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}