import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Calendar, MapPin, DollarSign, Gift, MessageSquare, Wrench, Users, Phone, Mail, CheckCircle, TriangleAlert, CalendarCheck, Lock, Check, Info, CalendarPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertRegistration } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertRegistration>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    expectations: "",
    newsletterOptIn: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const registrationMutation = useMutation({
    mutationFn: async (data: InsertRegistration) => {
      const response = await apiRequest("POST", "/api/registrations", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Registration Successful!",
          description: "Thank you for registering. You'll receive a confirmation email shortly with further details.",
        });
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          expectations: "",
          newsletterOptIn: false,
        });
        setTermsAccepted(false);
        setValidationErrors({});
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "An error occurred during registration. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateForm = () => {
    const errors: Record<string, boolean> = {};
    
    if (!formData.firstName.trim()) errors.firstName = true;
    if (!formData.lastName.trim()) errors.lastName = true;
    if (!formData.email.trim()) errors.email = true;
    if (!termsAccepted) errors.terms = true;
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = true;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      registrationMutation.mutate(formData);
    }
  };

  const updateFormData = (field: keyof InsertRegistration, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="navbar bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="logo-icon">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary ml-3">The Couples Journey</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-600 hover:text-primary transition-colors">About</button>
              <button onClick={() => scrollToSection('seminar')} className="text-gray-600 hover:text-primary transition-colors">Seminar</button>
              <button onClick={() => scrollToSection('register')} className="text-gray-600 hover:text-primary transition-colors">Register</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-primary transition-colors">Contact</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white hero-content py-20">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Strengthening Connections: A Journey Together
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Join us for an transformative seminar designed to deepen understanding, improve communication, and strengthen the bonds that matter most in your relationship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-8"
                onClick={() => scrollToSection('register')}
              >
                <CalendarPlus className="w-5 h-5 mr-2" />
                Register Now
              </Button>
              <Button 
                size="lg" 
                className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-primary px-8 backdrop-blur-sm"
                onClick={() => scrollToSection('seminar')}
              >
                <Info className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16" id="about">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">Why Choose The Couples Journey?</h2>
            <p className="text-lg text-gray-600">
              Our evidence-based approach combines years of research with practical tools that couples can immediately apply to their relationships.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="feature-card">
              <CardContent className="text-center p-8">
                <div className="feature-icon mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-semibold mb-4">Expert Guidance</h5>
                <p className="text-gray-600">
                  Learn from certified relationship counselors with over 15 years of experience helping couples build stronger connections.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card">
              <CardContent className="text-center p-8">
                <div className="feature-icon mx-auto mb-6">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-semibold mb-4">Practical Tools</h5>
                <p className="text-gray-600">
                  Take home actionable strategies and communication techniques that you can implement immediately in your daily life.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card">
              <CardContent className="text-center p-8">
                <div className="feature-icon mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h5 className="text-xl font-semibold mb-4">Community Support</h5>
                <p className="text-gray-600">
                  Connect with other couples on similar journeys and build a supportive network that extends beyond the seminar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seminar Details */}
      <section className="py-16 bg-white" id="seminar">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-6">Seminar Details</h2>
              <p className="text-lg text-gray-600">Everything you need to know about our upcoming seminar</p>
            </div>
            
            <Card className="seminar-details">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold mb-1">Date & Time</h6>
                      <p className="text-gray-600 mb-0">Saturday, March 23rd, 2024<br/>9:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold mb-1">Location</h6>
                      <p className="text-gray-600 mb-0">Grand Wellness Center<br/>1234 Harmony Boulevard, Suite 100</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold mb-1">Investment</h6>
                      <p className="text-gray-600 mb-0">$149 per couple<br/>Early bird: $99 (until March 1st)</p>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <div className="detail-icon">
                      <Gift className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h6 className="font-semibold mb-1">What's Included</h6>
                      <p className="text-gray-600 mb-0">Workbook, lunch, resources<br/>& follow-up materials</p>
                    </div>
                  </div>
                </div>
                
                <div className="learning-section">
                  <h5 className="text-xl font-semibold mb-6 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                    What You'll Learn
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Effective communication strategies</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Conflict resolution techniques</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Building emotional intimacy</span>
                      </li>
                    </ul>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Trust-building exercises</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Future planning together</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span>Maintaining long-term connection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="registration-bg py-16" id="register">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="registration-section">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">Reserve Your Spot Today</h2>
                  <p className="text-lg text-gray-600">Limited seating available. Secure your place in this transformative experience.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className={validationErrors.firstName ? 'border-red-500' : ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={validationErrors.email ? 'border-red-500' : ''}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="expectations">What do you hope to gain from this seminar?</Label>
                    <Textarea
                      id="expectations"
                      value={formData.expectations}
                      onChange={(e) => updateFormData('expectations', e.target.value)}
                      placeholder="Tell us about your goals and expectations..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletterOptIn"
                        checked={formData.newsletterOptIn}
                        onCheckedChange={(checked) => updateFormData('newsletterOptIn', checked as boolean)}
                      />
                      <Label htmlFor="newsletterOptIn" className="text-sm">
                        I'd like to receive updates about future workshops and relationship resources
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="termsAgreement"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => {
                          setTermsAccepted(checked as boolean);
                          if (validationErrors.terms && checked) {
                            setValidationErrors(prev => ({ ...prev, terms: false }));
                          }
                        }}
                        className={validationErrors.terms ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="termsAgreement" className="text-sm">
                        I agree to the <button type="button" className="text-primary underline">terms and conditions</button> and <button type="button" className="text-primary underline">privacy policy</button> *
                      </Label>
                    </div>
                  </div>
                  
                  {(Object.keys(validationErrors).length > 0) && (
                    <Alert className="border-red-200 bg-red-50">
                      <TriangleAlert className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-600">
                        Please fill in all required fields correctly.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-center">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="btn-primary px-8"
                      disabled={registrationMutation.isPending}
                    >
                      <CalendarCheck className="w-5 h-5 mr-2" />
                      {registrationMutation.isPending ? 'Registering...' : 'Register for Seminar'}
                    </Button>
                  </div>
                </form>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500 flex items-center justify-center">
                    <Lock className="w-4 h-4 mr-1" />
                    Your information is secure and will only be used for seminar-related communications.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="logo-icon">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h5 className="text-xl font-semibold ml-3">The Couples Journey</h5>
              </div>
              <p className="text-gray-300">
                Helping couples build stronger, more fulfilling relationships through evidence-based guidance and practical tools.
              </p>
            </div>
            
            <div>
              <h6 className="text-lg font-semibold mb-4">Contact Information</h6>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>info@thecouplesjourney.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3" />
                  <span>1234 Harmony Boulevard, Suite 100</span>
                </div>
              </div>
            </div>
            
            <div>
              <h6 className="text-lg font-semibold mb-4">Quick Links</h6>
              <div className="flex flex-col space-y-2">
                <button onClick={() => scrollToSection('about')} className="text-left text-gray-300 hover:text-white transition-colors">About Us</button>
                <button className="text-left text-gray-300 hover:text-white transition-colors">Resources</button>
                <button className="text-left text-gray-300 hover:text-white transition-colors">Privacy Policy</button>
              </div>
            </div>
          </div>
          
          <hr className="my-8 border-gray-700" />
          
          <div className="text-center">
            <p className="text-gray-400">
              &copy; 2024 The Couples Journey. All rights reserved. | Building stronger relationships, one couple at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
