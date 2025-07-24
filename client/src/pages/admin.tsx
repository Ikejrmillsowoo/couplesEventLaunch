import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Registration } from "@shared/schema";

export default function Admin() {
  const { data: registrationsData, isLoading } = useQuery({
    queryKey: ['/api/registrations'],
  });

  const registrations: Registration[] = (registrationsData as any)?.data || [];

  const openGoogleSheets = () => {
    const sheetId = 'YOUR_SHEET_ID'; // This will be replaced with actual ID
    window.open(`https://docs.google.com/spreadsheets/d/${sheetId}/edit`, '_blank');
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
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View in Google Sheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={openGoogleSheets}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Google Sheets
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  View and manage all registration data directly in your Google Sheets
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