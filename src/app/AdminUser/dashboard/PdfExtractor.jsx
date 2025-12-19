'use client';

import React, { useState, useCallback } from 'react';

const PdfExtractor = ({ onExtractedData }) => {
  const [pdfText, setPdfText] = useState('');
  const [extractedData, setExtractedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to extract text from PDF using pdf.js
  const extractTextFromPDF = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      throw new Error('Please upload a valid PDF file');
    }

    setIsLoading(true);
    try {
      // Dynamically import pdfjs-dist to reduce bundle size
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      setPdfText(fullText);
      return fullText;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple data extraction logic - can be enhanced based on specific PDF formats
  const extractDataFromText = (text) => {
    const data = {};
    
    // Extract common fields using regex patterns
    const orderNumberMatch = text.match(/Order\s*#?\s*:?\s*([A-Z0-9\-]+)/i);
    if (orderNumberMatch) {
      data.orderNumber = orderNumberMatch[1];
    }
    
    const customerMatch = text.match(/Customer\s*:?\s*([A-Za-z0-9\s\-\.,]+)/i);
    if (customerMatch) {
      data.customer = customerMatch[1].trim();
    }
    
    const productMatch = text.match(/Product\s*:?\s*([A-Za-z0-9\s\-\.,]+)/i);
    if (productMatch) {
      data.product = productMatch[1].trim();
    }
    
    const quantityMatch = text.match(/Quantity\s*:?\s*(\d+)/i);
    if (quantityMatch) {
      data.quantity = parseInt(quantityMatch[1]);
    }
    
    const dateMatch = text.match(/Date\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    if (dateMatch) {
      data.date = dateMatch[1];
    }
    
    return data;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await extractTextFromPDF(file);
      const data = extractDataFromText(text);
      setExtractedData(data);
      setIsEditing(true);
      
      // Pass extracted data to parent component
      if (onExtractedData) {
        onExtractedData(data);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDataChange = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Pass updated data to parent component
    if (onExtractedData) {
      onExtractedData(extractedData);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setExtractedData({});
    setPdfText('');
  };

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-blue-700">Extracting data from PDF...</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!isEditing ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className="text-gray-600">Upload a PDF to extract data</p>
            <label className="bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700">
              Select PDF File
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-black mb-3">Extracted Data Preview</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                value={extractedData.orderNumber || ''}
                onChange={(e) => handleDataChange('orderNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                value={extractedData.customer || ''}
                onChange={(e) => handleDataChange('customer', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Product</label>
              <input
                type="text"
                value={extractedData.product || ''}
                onChange={(e) => handleDataChange('product', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={extractedData.quantity || ''}
                onChange={(e) => handleDataChange('quantity', parseInt(e.target.value) || '')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">Date</label>
              <input
                type="text"
                value={extractedData.date || ''}
                onChange={(e) => handleDataChange('date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700"
            >
              Save & Apply
            </button>
            <button
              onClick={handleCancel}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfExtractor;