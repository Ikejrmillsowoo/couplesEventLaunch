import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Users, FileSpreadsheet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Registration } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['/api/registrations'],
  });

  const registrations: Registration[] = (registrationsData as any)?.data || [];

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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage seminar registrations</p>
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
                          {new Date(registration.registeredAt).toLocaleDateString()}
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