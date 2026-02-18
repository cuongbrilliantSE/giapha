import React from 'react';
import { FileImage, FileText } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LogoutButton from './LogoutButton';

const ExportControls = () => {
  const { getNodes } = useReactFlow();
  const SHOW_EXPORT = false;

  const handleExport = async (type: 'image' | 'pdf') => {
    // Capture the whole flow container to include SVG edges consistently
    const container = document.querySelector('.react-flow') as HTMLElement;
    const controls = document.querySelector('.react-flow__controls') as HTMLElement | null;
    const minimap = document.querySelector('.react-flow__minimap') as HTMLElement | null;

    if (!container) return;

    try {
        // Hide overlays during capture to avoid covering content
        const restore: Array<() => void> = [];
        [controls, minimap].forEach(el => {
          if (el) {
            const prev = el.style.visibility;
            el.style.visibility = 'hidden';
            restore.push(() => (el.style.visibility = prev));
          }
        });
        const prevBg = container.style.backgroundColor;
        container.style.backgroundColor = '#ffffff';
        
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          foreignObjectRendering: true,
        });
        
        restore.forEach(fn => fn());
        container.style.backgroundColor = prevBg;
        
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
      <LogoutButton inline />
      {SHOW_EXPORT && (
        <>
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
        </>
      )}
    </div>
  );
};

export default ExportControls;
