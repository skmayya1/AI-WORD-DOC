import { useEffect, useRef, useState, useCallback } from 'react';
import { LexicalEditor } from 'lexical';

const A4_CONFIG = {
  HEIGHT: 1123, // A4 height in pixels at 96 DPI
  WIDTH: 794, // A4 width in pixels at 96 DPI
};
// Add border/separator compensation
const PAGE_SEPARATOR_HEIGHT = 1; // Height of border/separator between pages

interface PageInfo {
  pageNumber: number;
  startY: number;
  endY: number;
  contentHeight: number; // Track actual content height per page
}

interface NodeMeasurement {
  element: HTMLElement;
  height: number;
  offsetTop: number;
  pageBreak?: boolean;
  isTable?: boolean; // Special handling for tables
  isImage?: boolean; // Special handling for images
}

export const usePagination = (
  editor: LexicalEditor,
  margins: { top: number, bottom: number, left: number, right: number },
  options?: {
    orphanLines?: number;
    widowLines?: number;
    debugMode?: boolean;
  }
) => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const getAvailablePageHeight = useCallback(() => {
    return A4_CONFIG.HEIGHT - (margins.top + margins.bottom) * 96;
  }, [margins]);

  const getPageContentStartY = useCallback((pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    const marginTopPx = margins.top * 96;
    const totalPageSpacing = A4_CONFIG.HEIGHT + PAGE_SEPARATOR_HEIGHT;
    return pageIndex * totalPageSpacing + marginTopPx;
  }, [margins]);

  const measureNodes = useCallback((): NodeMeasurement[] => {
    const editorElement = document.querySelector('.editor-content');
    if (!editorElement) return [];
    const measurements: NodeMeasurement[] = [];
    const childNodes = Array.from(editorElement.children) as HTMLElement[];
    const editorRect = editorElement.getBoundingClientRect();

    childNodes.forEach((node) => {
      const originalMarginTop = node.style.marginTop;
      node.style.marginTop = '0px';
      const computedStyle = window.getComputedStyle(node);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      const rect = node.getBoundingClientRect();
      const tagName = node.tagName.toLowerCase();
      const isTable = tagName === 'table' || node.querySelector('table') !== null;
      const isImage = tagName === 'img' || node.querySelector('img') !== null;
      measurements.push({
        element: node,
        height: rect.height + marginTop + marginBottom,
        offsetTop: rect.top - editorRect.top,
        pageBreak: node.classList.contains('page-break') || node.dataset.pageBreak === 'true',
        isTable,
        isImage,
      });
      node.style.marginTop = originalMarginTop;
    });
    return measurements;
  }, []);

  const shouldKeepTogether = (measurement: NodeMeasurement, availableHeight: number): boolean => {
    const { height, isTable, isImage } = measurement;
    if (isTable && height < availableHeight * 0.8) {
      return true;
    }
    if (isImage && height < availableHeight * 0.6) {
      return true;
    }
    return false;
  };

  const calculatePagination = useCallback(() => {
    setIsRecalculating(true);
    try {
      const measurements = measureNodes();
      const availableHeight = getAvailablePageHeight();
      const newPages: PageInfo[] = [];
      if (options?.debugMode) {
        console.log('Measurements:', measurements);
        console.log('Available height:', availableHeight);
      }
      let currentPageHeight = 0;
      let currentPage = 1;
      let absoluteContentTop = margins.top * 96;
      newPages.push({
        pageNumber: currentPage,
        startY: getPageContentStartY(currentPage),
        endY: getPageContentStartY(currentPage) + availableHeight,
        contentHeight: 0,
      });

      measurements.forEach((measurement, index) => {
        const { element, height, pageBreak } = measurement;
        if (pageBreak) {
          const nextPageContentStartY = getPageContentStartY(currentPage + 1);
          const currentAbsolutePosition = absoluteContentTop + currentPageHeight;
          const distanceToNextPage = nextPageContentStartY - currentAbsolutePosition;
          // Add page break styling and margin
          element.style.cssText += `
            page-break-before: always;
            border-top: 1px solid #ccc;
            margin-top: ${Math.max(0, distanceToNextPage)}px !important;
          `;
          if (options?.debugMode) {
            console.log(`Page break - Current absolute: ${currentAbsolutePosition}, Next page start: ${nextPageContentStartY}, Distance: ${distanceToNextPage}`);
          }
          if (newPages[currentPage - 1]) {
            newPages[currentPage - 1].contentHeight = currentPageHeight;
          }
          currentPage++;
          currentPageHeight = height;
          absoluteContentTop = nextPageContentStartY;
          newPages.push({
            pageNumber: currentPage,
            startY: getPageContentStartY(currentPage),
            endY: getPageContentStartY(currentPage) + availableHeight,
            contentHeight: 0,
          });
          if (options?.debugMode) {
            console.log('Updated pages after page break:', newPages);
          }
          return;
        }
        const wouldOverflow = currentPageHeight + height > availableHeight;
        const shouldKeepElementTogether = shouldKeepTogether(measurement, availableHeight);
        if (wouldOverflow && index !== 0) {
          const nextPageContentStartY = getPageContentStartY(currentPage + 1);
          const currentAbsolutePosition = absoluteContentTop + currentPageHeight;
          const distanceToNextPage = nextPageContentStartY - currentAbsolutePosition - margins.top * 96;
          element.style.cssText += `
            page-break-before: always;
            border-top: 1px solid #ccc;
            padding-top: ${margins.top * 96}px;
            margin-top: ${Math.max(0, distanceToNextPage)}px !important;
          `;
          if (options?.debugMode) {
            console.log(`Page overflow - Current absolute: ${currentAbsolutePosition}, Next page start: ${nextPageContentStartY}, Distance: ${distanceToNextPage}`);
          }
          if (newPages[currentPage - 1]) {
            newPages[currentPage - 1].contentHeight = currentPageHeight;
          }
          currentPage++;
          currentPageHeight = height;
          absoluteContentTop = nextPageContentStartY;
          newPages.push({
            pageNumber: currentPage,
            startY: getPageContentStartY(currentPage),
            endY: getPageContentStartY(currentPage) + availableHeight,
            contentHeight: 0,
          });
        } else {
          // Remove any existing page break styling
          element.style.pageBreakBefore = '';
          element.style.borderTop = '';
          element.style.marginTop = '0px';
          currentPageHeight += height;
        }
      });
      // Update final page content height
      if (newPages[currentPage - 1]) {
        newPages[currentPage - 1].contentHeight = currentPageHeight;
      }
      if (options?.debugMode) {
        console.log('Final pages:', newPages);
        newPages.forEach((page, index) => {
          console.log(`Page ${page.pageNumber}: startY=${page.startY}, endY=${page.endY}, contentHeight=${page.contentHeight}`);
        });
      }
      setPages(newPages);
    } catch (error) {
      console.error('Error calculating pagination:', error);
    } finally {
      setIsRecalculating(false);
    }
  }, [measureNodes, getAvailablePageHeight, getPageContentStartY, margins, options?.debugMode]);

  const recalculateWithDelay = useCallback(() => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }
    measurementTimeoutRef.current = setTimeout(() => {
      calculatePagination();
    }, 150); // Slightly longer delay for stability
  }, [calculatePagination]);

  useEffect(() => {
    const editorElement = document.querySelector('.editor-content');
    if (!editorElement) return;
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    resizeObserverRef.current = new ResizeObserver(() => {
      recalculateWithDelay();
    });
    resizeObserverRef.current.observe(editorElement);
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [recalculateWithDelay]);

  useEffect(() => {
    if (!editor) return;
    recalculateWithDelay();
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        recalculateWithDelay();
      });
    });
    return () => {
      unregisterUpdateListener();
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
      }
    };
  }, [editor, recalculateWithDelay]);

  return {
    pages,
    isRecalculating,
    recalculate: calculatePagination,
    availableHeight: getAvailablePageHeight(),
    totalPages: pages.length,
  };
};