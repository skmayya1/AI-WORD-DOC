import { useEffect, useRef, useState } from 'react';
import { LexicalEditor } from 'lexical';

const A4_CONFIG = {
  HEIGHT: 1123,
  WIDTH: 794,
  // Adjust based on your margins
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
    const availablePageHeight = getAvailablePageHeight();
    let absolutePosition = margins.top * 96; // Start with top margin
    let currentPage = 1;
    const newPages: PageInfo[] = [];

    // Add first page with consistent height calculation
    const firstPageStartY = 0;
    const firstPageEndY = firstPageStartY + A4_CONFIG.HEIGHT;
    const firstPageContentEndY = firstPageStartY + (margins.top * 96) + availablePageHeight;

    newPages.push({
      pageNumber: 1,
      startY: firstPageStartY,
      endY: firstPageEndY
    });

    measurements.forEach((measurement, index) => {
      const { element, height, pageBreak } = measurement;

      // Check if this is a page break node
      if (pageBreak) {
        // Force start new page
        currentPage++;
        const nextPageStartY = (currentPage - 1) * A4_CONFIG.HEIGHT;
        const targetPosition = nextPageStartY + (margins.top * 96);
        const marginTopNeeded = targetPosition - absolutePosition;

        element.style.marginTop = `${marginTopNeeded}px`;
        absolutePosition = targetPosition + height;

        newPages.push({
          pageNumber: currentPage,
          startY: nextPageStartY,
          endY: nextPageStartY + A4_CONFIG.HEIGHT
        });

        return;
      }

      // Calculate current page boundaries consistently
      const currentPageStartY = (currentPage - 1) * A4_CONFIG.HEIGHT;
      const currentPageContentStartY = currentPageStartY + (margins.top * 96);
      const currentPageContentEndY = currentPageStartY + (margins.top * 96) + availablePageHeight;

      createDebugLine(currentPageStartY, `Page ${currentPage} Start`, 'blue');
      createDebugLine(currentPageContentStartY, `Page ${currentPage} Content Start`, 'green');
      createDebugLine(currentPageContentEndY, `Page ${currentPage} Content End`, 'orange');
      createDebugLine(currentPageStartY + A4_CONFIG.HEIGHT, `Page ${currentPage} End`, 'red');

      // Check if adding this node would exceed current page content boundary
      if (absolutePosition + height > currentPageContentEndY) {
        // Move to next page
        currentPage++;

        const nextPageStartY = (currentPage - 1) * A4_CONFIG.HEIGHT;
        const nextPageContentStartY = nextPageStartY + (margins.top * 96);
        const marginTopNeeded = nextPageContentStartY - absolutePosition;

        // Apply margin to push element to next page
        element.style.marginTop = `${marginTopNeeded}px`;
        absolutePosition = nextPageContentStartY + height;

        // Add new page
        newPages.push({
          pageNumber: currentPage,
          startY: nextPageStartY,
          endY: nextPageStartY + A4_CONFIG.HEIGHT
        });
      } else {
        // Element fits on current page
        element.style.marginTop = '';
        absolutePosition += height;
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


const createDebugLine = (yPosition: number, label: string, color: string) => {
  const editorContainer = document.querySelector('.mx-auto.relative.my-10') as HTMLElement;
  if (!editorContainer) return;

  // Remove existing debug lines to prevent accumulation
  const existingLines = editorContainer.querySelectorAll('.debug-page-line');
  existingLines.forEach(line => line.remove());

  const line = document.createElement('div');
  line.className = 'debug-page-line';
  line.style.cssText = `
      position: absolute;
      top: ${yPosition}px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${color};
      border-top: 2px dashed ${color};
      z-index: 100;
      pointer-events: none;
    `;

  // Add label
  const labelEl = document.createElement('div');
  labelEl.textContent = label;
  labelEl.style.cssText = `
      position: absolute;
      top: -20px;
      left: 10px;
      background: ${color};
      color: white;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 3px;
      white-space: nowrap;
    `;

  line.appendChild(labelEl);
  editorContainer.appendChild(line);
};