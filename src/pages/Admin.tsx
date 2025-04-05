
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllCreditRequests,
  updateCreditRequest,
  getAllScanRecords
} from '@/services/dataService';
import { CreditRequest, ScanRecord } from '@/models/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Admin = () => {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [scanRecords, setScanRecords] = useState<ScanRecord[]>([]);
  const [dailyScans, setDailyScans] = useState<{ date: string; count: number }[]>([]);
  const [topUsers, setTopUsers] = useState<{ name: string; scans: number }[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load credit requests
    const requests = getAllCreditRequests();
    setCreditRequests(requests);

    // Load scan records
    const records = getAllScanRecords();
    setScanRecords(records);

    // Process daily scans for chart
    processScansData(records);
  };

  const processScansData = (records: ScanRecord[]) => {
    // Process daily scans
    const scansByDay = records.reduce((acc: Record<string, number>, scan) => {
      const dateStr = new Date(scan.timestamp).toLocaleDateString();
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {});

    const dailyData = Object.entries(scansByDay).map(([date, count]) => ({
      date,
      count
    }));

    setDailyScans(dailyData);

    // Process top users
    const scansByUser = records.reduce((acc: Record<string, { name: string; scans: number }>, scan) => {
      if (!acc[scan.userId]) {
        acc[scan.userId] = { name: scan.userName, scans: 0 };
      }
      acc[scan.userId].scans += 1;
      return acc;
    }, {});

    const userList = Object.values(scansByUser);
    userList.sort((a, b) => b.scans - a.scans);
    setTopUsers(userList.slice(0, 10)); // Top 10 users
  };

  const handleApproveRequest = (requestId: string, userId: string, credits: number) => {
    updateCreditRequest(requestId, 'approved');
    
    // Update local state
    setCreditRequests(creditRequests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    
    // In a real system, we would update the user's credits here
    // For this demo, we'll just show a success message
    toast({
      title: "Request approved",
      description: `Approved ${credits} credits for user.`,
    });
  };

  const handleRejectRequest = (requestId: string) => {
    updateCreditRequest(requestId, 'rejected');
    
    // Update local state
    setCreditRequests(creditRequests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    
    toast({
      title: "Request rejected",
      description: "The credit request has been rejected.",
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 container py-6 text-center">
          <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{topUsers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Scans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{scanRecords.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {creditRequests.filter(req => req.status === 'pending').length}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="analytics">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="credit-requests">Credit Requests</TabsTrigger>
            <TabsTrigger value="top-users">Top Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Daily Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {dailyScans.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyScans}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" name="Scans" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No scan data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="credit-requests">
            <Card>
              <CardHeader>
                <CardTitle>Credit Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {creditRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Credits Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.userName}</TableCell>
                          <TableCell>{formatDate(request.requestDate)}</TableCell>
                          <TableCell>{request.requestedCredits}</TableCell>
                          <TableCell>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {request.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-500 hover:text-green-700"
                                  onClick={() => handleApproveRequest(request.id, request.userId, request.requestedCredits)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => handleRejectRequest(request.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No credit requests found.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="top-users">
            <Card>
              <CardHeader>
                <CardTitle>Top Users by Scan Count</CardTitle>
              </CardHeader>
              <CardContent>
                {topUsers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Total Scans</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topUsers.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.scans}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No user data available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
