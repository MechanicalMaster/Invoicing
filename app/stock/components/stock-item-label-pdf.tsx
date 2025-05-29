"use client";

import { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Constants for unit conversion
const MM_TO_PT = 2.83465; // 1mm = 2.83465pt

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

// Calculate size based on label type
const getLabelSize = (type: 'standard' | 'large' | 'small') => {
  switch (type) {
    case 'large':
      return {
        width: 3 * 72, // 3 inches in points
        height: 2 * 72, // 2 inches in points
      };
    case 'small':
      return {
        width: 1.5 * 72, // 1.5 inches in points
        height: 1 * 72, // 1 inch in points
      };
    case 'standard':
    default:
      return {
        width: 2.25 * 72, // 2.25 inches in points
        height: 1.25 * 72, // 1.25 inches in points
      };
  }
};

// Component props
type StockItemLabelPDFProps = {
  itemData: StockItemData;
  labelSettings: LabelSettings;
};

// Create PDF Document component
const StockItemLabelPDF = ({ itemData, labelSettings }: StockItemLabelPDFProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const labelSize = getLabelSize(labelSettings.type);
  
  // Generate QR code when component mounts or when relevant props change
  useEffect(() => {
    const generateQRCode = async () => {
      if (labelSettings.includeQrCode) {
        try {
          // QR width based on label size - 10mm width
          const qrWidth = 30; // ~10mm at 72 DPI
          const dataUrl = await QRCode.toDataURL(itemData.id, { 
            errorCorrectionLevel: labelSettings.qrErrorCorrection, 
            width: qrWidth,
            margin: 1
          });
          setQrDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };
    
    generateQRCode();
  }, [itemData.id, labelSettings.includeQrCode, labelSettings.qrErrorCorrection]);
  
  // Define styles
  const styles = StyleSheet.create({
    page: {
      padding: 0,
      width: labelSize.width,
      height: labelSize.height,
    },
    labelContainer: {
      width: '100%',
      height: '100%',
      padding: 5,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      border: '1pt solid #ccc',
    },
    header: {
      fontSize: 10,
      fontWeight: 'bold',
      marginBottom: 4,
      textAlign: 'center',
    },
    infoRow: {
      marginBottom: 2,
      fontSize: 8,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    labelText: {
      fontSize: 8,
      fontWeight: 'bold',
    },
    value: {
      fontSize: 8,
    },
    price: {
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 4,
    },
    qrCodeContainer: {
      alignSelf: 'center',
      marginTop: 3,
      marginBottom: 3,
    },
    qrCodeImage: {
      width: 10 * MM_TO_PT, // 10mm
      height: 10 * MM_TO_PT, // 10mm
    },
    footer: {
      fontSize: 6,
      textAlign: 'center',
      color: '#666',
      marginTop: 2,
    },
  });
  
  // Generate document with specified number of copies
  const copies = Array.from({ length: labelSettings.copies }, (_, i) => i);
  
  return (
    <Document>
      {copies.map((_, index) => (
        <Page key={index} size={[labelSize.width, labelSize.height]} style={styles.page}>
          <View style={styles.labelContainer}>
            {labelSettings.includeProductName && (
              <Text style={styles.header}>{itemData.name}</Text>
            )}
            
            <View style={styles.infoRow}>
              {labelSettings.includeMetal && (
                <View>
                  <Text style={styles.labelText}>Metal:</Text>
                  <Text style={styles.value}>{itemData.material}</Text>
                </View>
              )}
              
              {labelSettings.includePurity && (
                <View>
                  <Text style={styles.labelText}>Purity:</Text>
                  <Text style={styles.value}>{itemData.purity || 'N/A'}</Text>
                </View>
              )}
              
              {labelSettings.includeWeight && (
                <View>
                  <Text style={styles.labelText}>Weight:</Text>
                  <Text style={styles.value}>{itemData.weight}g</Text>
                </View>
              )}
            </View>
            
            {labelSettings.includePrice && (
              <Text style={styles.price}>₹{itemData.price.toLocaleString()}</Text>
            )}
            
            {labelSettings.includeQrCode && qrDataUrl && (
              <View style={styles.qrCodeContainer}>
                <Image src={qrDataUrl} style={styles.qrCodeImage} />
              </View>
            )}
            
            {labelSettings.includeDate && (
              <Text style={styles.footer}>
                Date: {itemData.dateAdded.toLocaleDateString()}
              </Text>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default StockItemLabelPDF; 