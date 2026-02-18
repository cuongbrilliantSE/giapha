import React from 'react';
import { FileImage, FileText } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExportControls = () => {
  const { getNodes } = useReactFlow();

  const handleExport = async (type: 'image' | 'pdf') => {
    // We target the renderer element which contains the canvas
    const renderer = document.querySelector('.react-flow__renderer') as HTMLElement;
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (!renderer || !viewport) return;

    try {
        // Simple capture of the visible area
        const canvas = await html2canvas(renderer, {
            scale: 2, 
            useCORS: true,
            logging: false,
            ignoreElements: (element) => {
                // Ignore controls and minimap if needed, but they are outside viewport usually
                return element.classList.contains('react-flow__controls') || 
                       element.classList.contains('react-flow__minimap');
            }
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        if (type === 'image') {
            const a = document.createElement('a');
            a.href = imgData;
            a.download = 'giapha.png';
            a.click();
        } else {
            const pdf = new jsPDF({
                orientation: 'landscape',
            });
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('giapha.pdf');
        }
    } catch (err) {
        console.error('Export failed:', err);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md flex flex-col gap-2 border border-gray-200">
      <button 
        onClick={() => handleExport('image')}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center justify-center gap-2"
        title="Xuất ảnh PNG"
      >
        <FileImage size={20} />
      </button>
      <button 
        onClick={() => handleExport('pdf')}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-700 flex items-center justify-center gap-2"
        title="Xuất file PDF"
      >
        <FileText size={20} />
      </button>
    </div>
  );
};

export default ExportControls;
