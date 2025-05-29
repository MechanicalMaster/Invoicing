"use client";

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import StockItemLabelPDF from './stock-item-label-pdf';

// Define types
type LabelSettings = {
  type: 'standard' | 'large' | 'small';
  copies: number;
  includeProductName: boolean;
  includePrice: boolean;
  includeBarcode: boolean;
  includeDate: boolean;
  includeMetal: boolean;
  includeWeight: boolean;
  includePurity: boolean;
  includeQrCode: boolean;
  qrErrorCorrection: 'L' | 'M' | 'Q' | 'H';
};

type StockItemData = {
  id: string;
  name: string;
  price: number;
  category: string;
  material: string;
  weight: number;
  purity: string | null;
  dateAdded: Date;
};

type StockItemLabelDownloadWrapperProps = {
  itemData: StockItemData;
  labelSettings: LabelSettings;
};

const StockItemLabelDownloadWrapper = ({ 
  itemData, 
  labelSettings 
}: StockItemLabelDownloadWrapperProps) => {
  const [isClient, setIsClient] = useState(false);
  
  // React-PDF requires client-side rendering, so we use this effect to ensure we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <Button disabled>
        <Printer className="mr-2 h-4 w-4" />
        Preparing Label...
      </Button>
    );
  }
  
  return (
    <PDFDownloadLink
      document={<StockItemLabelPDF itemData={itemData} labelSettings={labelSettings} />}
      fileName={`label-${itemData.id}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ blob, url, loading, error }) => 
        loading ? (
          <Button disabled>
            <Printer className="mr-2 h-4 w-4" />
            Generating PDF...
          </Button>
        ) : (
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Label
          </Button>
        )
      }
    </PDFDownloadLink>
  );
};

export default StockItemLabelDownloadWrapper; 