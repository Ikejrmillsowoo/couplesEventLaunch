import { type User, type InsertUser, type Registration, type InsertRegistration } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  getAllRegistrations(): Promise<Registration[]>;
  getRegistrationByEmail(email: string): Promise<Registration | undefined>;
}

export class GoogleSheetsStorage implements IStorage {
  private apiKey: string;
  private sheetId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
    this.sheetId = process.env.GOOGLE_SHEET_ID || '';
    this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.sheetId}`;
    
    if (!this.apiKey || !this.sheetId) {
      throw new Error('Google Sheets API key and Sheet ID must be provided');
    }
  }

  // User methods (simplified for this use case)
  async getUser(id: number): Promise<User | undefined> {
    return undefined; // Not implemented for Google Sheets
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined; // Not implemented for Google Sheets
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    throw new Error('User creation not implemented for Google Sheets');
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    try {
      // First, ensure the sheet has headers
      await this.ensureHeaders();
      
      // Create the registration object with ID and timestamp
      const registration: Registration = {
        id: Date.now(), // Use timestamp as ID
        firstName: insertRegistration.firstName,
        lastName: insertRegistration.lastName,
        email: insertRegistration.email,
        phone: insertRegistration.phone || null,
        expectations: insertRegistration.expectations || null,
        newsletterOptIn: insertRegistration.newsletterOptIn || false,
        registeredAt: new Date()
      };

      // Prepare row data for Google Sheets
      const rowData = [
        registration.id,
        registration.firstName,
        registration.lastName,
        registration.email,
        registration.phone || '',
        registration.expectations || '',
        registration.newsletterOptIn ? 'Yes' : 'No',
        registration.registeredAt?.toISOString() || new Date().toISOString()
      ];

      // Append to Google Sheets
      const response = await fetch(
        `${this.baseUrl}/values/Sheet1:append?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
      }

      return registration;
    } catch (error) {
      console.error('Error adding registration to Google Sheets:', error);
      throw error;
    }
  }

  async getAllRegistrations(): Promise<Registration[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/values/Sheet1?key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const data = await response.json();
      const rows = data.values || [];
      
      // Skip header row and convert to Registration objects
      return rows.slice(1).map((row: any[], index: number) => ({
        id: parseInt(row[0]) || index + 1,
        firstName: row[1] || '',
        lastName: row[2] || '',
        email: row[3] || '',
        phone: row[4] || null,
        expectations: row[5] || null,
        newsletterOptIn: row[6] === 'Yes',
        registeredAt: row[7] ? new Date(row[7]) : new Date()
      }));
    } catch (error) {
      console.error('Error fetching registrations from Google Sheets:', error);
      return [];
    }
  }

  async getRegistrationByEmail(email: string): Promise<Registration | undefined> {
    const allRegistrations = await this.getAllRegistrations();
    return allRegistrations.find(reg => reg.email === email);
  }

  private async ensureHeaders(): Promise<void> {
    try {
      // Check if sheet has data
      const response = await fetch(
        `${this.baseUrl}/values/Sheet1!A1:H1?key=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const data = await response.json();
      
      // If no data or first row doesn't look like headers, add them
      if (!data.values || !data.values[0] || data.values[0][0] !== 'ID') {
        const headers = [
          'ID',
          'First Name',
          'Last Name',
          'Email',
          'Phone',
          'Expectations',
          'Newsletter Opt-in',
          'Registration Date'
        ];

        await fetch(
          `${this.baseUrl}/values/Sheet1!A1:H1?valueInputOption=RAW&key=${this.apiKey}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [headers]
            })
          }
        );
      }
    } catch (error) {
      console.error('Error ensuring headers:', error);
    }
  }
}

export const storage = new GoogleSheetsStorage();
