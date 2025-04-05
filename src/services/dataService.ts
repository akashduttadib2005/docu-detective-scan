
import { Document, CreditRequest, ScanRecord } from '@/models/types';

// In a real application, these would be API calls to a backend service
// For this demo, we'll use localStorage to persist data

// Document functions
export const getAllDocuments = (): Document[] => {
  const storedDocs = localStorage.getItem('documents');
  return storedDocs ? JSON.parse(storedDocs) : [];
};

export const getUserDocuments = (userId: string): Document[] => {
  const allDocs = getAllDocuments();
  return allDocs.filter(doc => doc.userId === userId);
};

export const saveDocument = (doc: Document): void => {
  const allDocs = getAllDocuments();
  const updatedDocs = [...allDocs, doc];
  localStorage.setItem('documents', JSON.stringify(updatedDocs));
};

export const deleteDocument = (docId: string): void => {
  const allDocs = getAllDocuments();
  const updatedDocs = allDocs.filter(doc => doc.id !== docId);
  localStorage.setItem('documents', JSON.stringify(updatedDocs));
};

// Credit request functions
export const getAllCreditRequests = (): CreditRequest[] => {
  const storedRequests = localStorage.getItem('creditRequests');
  return storedRequests ? JSON.parse(storedRequests) : [];
};

export const getUserCreditRequests = (userId: string): CreditRequest[] => {
  const allRequests = getAllCreditRequests();
  return allRequests.filter(req => req.userId === userId);
};

export const saveCreditRequest = (request: CreditRequest): void => {
  const allRequests = getAllCreditRequests();
  const updatedRequests = [...allRequests, request];
  localStorage.setItem('creditRequests', JSON.stringify(updatedRequests));
};

export const updateCreditRequest = (requestId: string, status: 'approved' | 'rejected'): void => {
  const allRequests = getAllCreditRequests();
  const updatedRequests = allRequests.map(req => 
    req.id === requestId ? { ...req, status } : req
  );
  localStorage.setItem('creditRequests', JSON.stringify(updatedRequests));
};

// Scan records for analytics
export const addScanRecord = (record: ScanRecord): void => {
  const storedRecords = localStorage.getItem('scanRecords');
  const allRecords = storedRecords ? JSON.parse(storedRecords) : [];
  const updatedRecords = [...allRecords, record];
  localStorage.setItem('scanRecords', JSON.stringify(updatedRecords));
};

export const getAllScanRecords = (): ScanRecord[] => {
  const storedRecords = localStorage.getItem('scanRecords');
  return storedRecords ? JSON.parse(storedRecords) : [];
};

// Document matching function using cosine similarity
export const findSimilarDocuments = (queryContent: string, allDocs: Document[]): [Document, number][] => {
  // Tokenize and count words in the query
  const queryWords = tokenize(queryContent);
  const queryWordCounts = countWords(queryWords);
  
  // Calculate similarity for each document
  const similarities: [Document, number][] = [];
  
  for (const doc of allDocs) {
    const docWords = tokenize(doc.content);
    const docWordCounts = countWords(docWords);
    
    // Calculate cosine similarity
    const similarity = calculateCosineSimilarity(queryWordCounts, docWordCounts);
    similarities.push([doc, similarity]);
  }
  
  // Sort by similarity (highest first)
  similarities.sort((a, b) => b[1] - a[1]);
  
  return similarities;
};

// Helper functions for document matching
function tokenize(text: string): string[] {
  // Simple tokenization: lowercase, remove punctuation, split by whitespace
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

function countWords(words: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return counts;
}

function calculateCosineSimilarity(
  countsA: Map<string, number>,
  countsB: Map<string, number>
): number {
  // Calculate dot product
  let dotProduct = 0;
  for (const [word, countA] of countsA.entries()) {
    const countB = countsB.get(word) || 0;
    dotProduct += countA * countB;
  }
  
  // Calculate magnitudes
  let magnitudeA = 0;
  for (const count of countsA.values()) {
    magnitudeA += count * count;
  }
  
  let magnitudeB = 0;
  for (const count of countsB.values()) {
    magnitudeB += count * count;
  }
  
  // Avoid division by zero
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  // Return cosine similarity
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}
