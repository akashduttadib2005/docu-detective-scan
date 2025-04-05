
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  getUserDocuments, 
  saveDocument, 
  deleteDocument, 
  findSimilarDocuments,
  getUserCreditRequests,
  saveCreditRequest, 
  addScanRecord
} from '@/services/dataService';
import { Document, CreditRequest } from '@/models/types';
import { FileSearch, Upload, Download, Trash2 } from "lucide-react";

const Dashboard = () => {
  const { currentUser, reduceCredits } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>(() => 
    currentUser ? getUserDocuments(currentUser.id) : []
  );
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<[Document, number][]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [creditRequestAmount, setCreditRequestAmount] = useState(10);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>(() => 
    currentUser ? getUserCreditRequests(currentUser.id) : []
  );
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentUser) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    
    if (file.type !== 'text/plain') {
      toast({
        title: "Invalid file type",
        description: "Please upload only .txt files",
        variant: "destructive",
      });
      setIsUploading(false);
      return;
    }
    
    try {
      const content = await readFileContent(file);
      const newDocument: Document = {
        id: Math.random().toString(36).substring(2, 15),
        name: file.name,
        content,
        userId: currentUser.id,
        uploadDate: new Date()
      };
      
      saveDocument(newDocument);
      
      const updatedDocs = getUserDocuments(currentUser.id);
      setDocuments(updatedDocs);
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };
  
  const handleDeleteDocument = (docId: string) => {
    deleteDocument(docId);
    setDocuments(documents.filter(doc => doc.id !== docId));
    toast({
      title: "Document deleted",
      description: "The document has been removed.",
    });
  };
  
  const handleSearch = () => {
    if (!searchText.trim()) {
      toast({
        title: "Search text required",
        description: "Please enter text to search for similar documents.",
        variant: "destructive",
      });
      return;
    }
    
    if (!currentUser) return;
    
    if (currentUser.creditsRemaining <= 0) {
      toast({
        title: "No credits remaining",
        description: "You've used all your daily credits. Request more or try again tomorrow.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = findSimilarDocuments(searchText, documents);
      setSearchResults(results);
      
      // Log this scan for admin analytics
      const scanRecord = {
        id: Math.random().toString(36).substring(2, 15),
        userId: currentUser.id,
        userName: currentUser.name,
        timestamp: new Date()
      };
      addScanRecord(scanRecord);
      
      // Reduce credits by 1
      reduceCredits();
      
      toast({
        title: "Search completed",
        description: `Found ${results.length} matching documents.`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "There was an error performing your search.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const downloadDocument = (doc: Document) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Document downloaded",
      description: `${doc.name} has been downloaded.`,
    });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };
  
  const handleCreditRequest = () => {
    if (!currentUser) return;
    
    const newRequest: CreditRequest = {
      id: Math.random().toString(36).substring(2, 15),
      userId: currentUser.id,
      userName: currentUser.name,
      requestDate: new Date(),
      status: 'pending',
      requestedCredits: creditRequestAmount
    };
    
    saveCreditRequest(newRequest);
    
    // Update the local state
    setCreditRequests([...creditRequests, newRequest]);
    
    toast({
      title: "Credit request submitted",
      description: `Your request for ${creditRequestAmount} credits is pending approval.`,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Credits banner */}
        <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="font-medium text-brand-800">Available Credits</h3>
            <p className="text-brand-600 text-2xl font-bold">{currentUser?.creditsRemaining || 0}</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-brand-300 text-brand-700">
                Request More Credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Additional Credits</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">
                  How many credits would you like to request?
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={creditRequestAmount}
                  onChange={(e) => setCreditRequestAmount(parseInt(e.target.value))}
                  className="mb-4"
                />
                <p className="text-sm text-muted-foreground">
                  Your request will be reviewed by an administrator.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={handleCreditRequest}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="documents">
          <TabsList className="mb-6">
            <TabsTrigger value="documents">My Documents</TabsTrigger>
            <TabsTrigger value="search">Document Search</TabsTrigger>
            <TabsTrigger value="requests">Credit Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>My Documents</span>
                  <div>
                    <input
                      type="file"
                      accept=".txt"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.name}</TableCell>
                          <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => downloadDocument(doc)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 hover:text-red-700" 
                                onClick={() => handleDeleteDocument(doc.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No documents found. Upload a document to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle>Search Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter text to find similar documents..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchText.trim() || !currentUser?.creditsRemaining}
                  >
                    <FileSearch className="h-4 w-4 mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Results (sorted by relevance)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document Name</TableHead>
                          <TableHead>Match Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map(([doc, similarity]) => (
                          <TableRow key={doc.id}>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>
                              <Badge variant={similarity > 0.7 ? "default" : similarity > 0.4 ? "secondary" : "outline"}>
                                {(similarity * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => downloadDocument(doc)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {searchText.trim() ? 'No results found. Try different search terms.' : 'Enter text to search for similar documents.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Credit Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {creditRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Request Date</TableHead>
                        <TableHead>Credits Requested</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditRequests.map((request) => (
                        <TableRow key={request.id}>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
