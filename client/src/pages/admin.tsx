import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, FileSpreadsheet, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import type { Registration } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check authentication status on component mount
  const { data: authData, isLoading: isAuthLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    staleTime: 0, // Always refetch to get latest auth status
    gcTime: 0, // Don't cache auth status
  });

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['/api/registrations'],
    enabled: (authData as any)?.isAuthenticated === true, // Only fetch if authenticated
  });

  const registrations: Registration[] = (registrationsData as any)?.data || [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthLoading && authData && !(authData as any).isAuthenticated) {
      setLocation("/login");
    }
  }, [authData, isAuthLoading, setLocation]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (response.ok) {
        // Invalidate auth cache to reflect logout
        queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
        queryClient.removeQueries({ queryKey: ['/api/registrations'] });
        
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        setLocation("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state while checking authentication
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!(authData as any)?.isAuthenticated) {
    return null;
  }

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/registrations/export');
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `seminar-registrations-${timestamp}.csv`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Registration data has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage seminar registrations</p>
            </div>
            <Button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Total Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {isLoading ? "..." : registrations.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleExportCSV}
                  disabled={isExporting || isLoading}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exporting..." : "Download CSV"}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Download all registration data as a CSV file for Excel or Google Sheets
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No registrations yet</div>
              ) : (
                <div className="space-y-4">
                  {registrations.slice(0, 5).map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">
                          {registration.firstName} {registration.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{registration.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString() : 'N/A'}
                        </p>
                        {registration.newsletterOptIn && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Newsletter
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {registrations.length > 5 && (
                    <p className="text-center text-gray-500 text-sm">
                      And {registrations.length - 5} more registrations...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}