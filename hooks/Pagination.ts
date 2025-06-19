import { useEffect, useRef, useState } from 'react';
import { LexicalEditor } from 'lexical';

const A4_CONFIG = {
  HEIGHT: 1123,
  WIDTH: 794,
  MARGIN_TOP: 96,
  MARGIN_BOTTOM: 96,
  MARGIN_LEFT: 96,
  MARGIN_RIGHT: 96,
};

interface PageInfo {
  pageNumber: number;
  startY: number;
  endY: number;
}

interface NodeMeasurement {
  element: HTMLElement;
  height: number;
  offsetTop: number;
  pageBreak?: boolean;
}

export const usePagination = (editor: LexicalEditor, margins: any) => {
  const [pages, setPages] = useState<PageInfo[]>([{ pageNumber: 1, startY: 0, endY: A4_CONFIG.HEIGHT }]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getAvailablePageHeight = () => {
    return A4_CONFIG.HEIGHT - (margins.top * 96) - (margins.bottom * 96);
  };

  const measureNodes = (): NodeMeasurement[] => {
    const editorElement = document.querySelector('.editor-content');
    if (!editorElement) return [];

    const measurements: NodeMeasurement[] = [];
    const childNodes = Array.from(editorElement.childNodes) as HTMLElement[];

    childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const rect = node.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(node);
        const marginTop = parseFloat(computedStyle.marginTop) || 0;
        const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
        
        measurements.push({
          element: node,
          height: rect.height + marginTop + marginBottom,
          offsetTop: node.offsetTop,
          pageBreak: node.classList.contains('page-break') || node.dataset.pageBreak === 'true'
        });
      }
    });

    return measurements;
  };

  const calculatePagination = () => {
    setIsRecalculating(true);
    
    const measurements = measureNodes();
    const availableHeight = getAvailablePageHeight();
    let currentPageHeight = margins.top * 96; // Start with top margin
    let currentPage = 1;
    const newPages: PageInfo[] = [];
    
    // Add first page
    newPages.push({
      pageNumber: 1,
      startY: 0,
      endY: A4_CONFIG.HEIGHT
    });

    measurements.forEach((measurement, index) => {
      const { element, height, pageBreak } = measurement;
      
      // Check if this is a page break node
      if (pageBreak) {
        // Force start new page
        const nextPageStartY = currentPage * A4_CONFIG.HEIGHT;
        const marginTopNeeded = nextPageStartY - currentPageHeight;
        
        element.style.marginTop = `${marginTopNeeded}px`;
        
        currentPage++;
        currentPageHeight = nextPageStartY + (margins.top * 96);
        
        newPages.push({
          pageNumber: currentPage,
          startY: nextPageStartY,
          endY: nextPageStartY + A4_CONFIG.HEIGHT
        });
        
        return;
      }
      
      // Check if adding this node would exceed current page
      if (currentPageHeight + height > (currentPage * A4_CONFIG.HEIGHT) - (margins.bottom * 96)) {
        // Calculate distance to next page
        const nextPageStartY = currentPage * A4_CONFIG.HEIGHT;
        const marginTopNeeded = nextPageStartY - currentPageHeight + (margins.top * 96);
        
        // Apply margin to push element to next page
        element.style.marginTop = `${marginTopNeeded}px`;
        
        currentPage++;
        currentPageHeight = nextPageStartY + (margins.top * 96) + height;
        
        newPages.push({
          pageNumber: currentPage,
          startY: nextPageStartY,
          endY: nextPageStartY + A4_CONFIG.HEIGHT
        });
      } else {
        // Element fits on current page
        element.style.marginTop = '';
        currentPageHeight += height;
      }
    });

    setPages(newPages);
    setIsRecalculating(false);
  };

  const recalculateWithDelay = () => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }
    
    measurementTimeoutRef.current = setTimeout(() => {
      calculatePagination();
    }, 100); // Small delay to allow DOM to update
  };

  useEffect(() => {
    if (!editor) return;

    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        recalculateWithDelay();
      });
    });

    // Initial calculation
    setTimeout(calculatePagination, 100);

    return () => {
      unregisterUpdateListener();
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
      }
    };
  }, [editor, margins]);

  return {
    pages,
    isRecalculating,
    recalculate: calculatePagination,
    availableHeight: getAvailablePageHeight()
  };
};
