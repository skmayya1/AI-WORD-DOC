import { useEffect, useRef, useState, useCallback } from 'react';
import { LexicalEditor } from 'lexical';

const A4_CONFIG = {
  HEIGHT: 1123, // A4 height in pixels at 96 DPI
  WIDTH: 794,   // A4 width in pixels at 96 DPI
};

// Add border/separator compensation
const PAGE_SEPARATOR_HEIGHT = 1; // Height of border/separator between pages (e.g., for a visual border)

interface PageInfo {
  pageNumber: number;
  startY: number; // Global Y start pixel of the page
  endY: number;   // Global Y end pixel of the page
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
    orphanLines?: number; // Not implemented in this version but kept for interface
    widowLines?: number;  // Not implemented in this version but kept for interface
    debugMode?: boolean;
  }
) => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  // New state to store indices of elements that received a margin-top for pagination
  const [elementsWithMarginTop, setElementsWithMarginTop] = useState<Set<number>>(new Set());
  const measurementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Calculates the available content height for a single page
  const getAvailablePageHeight = useCallback(() => {
    return A4_CONFIG.HEIGHT - (margins.top + margins.bottom) * 96;
  }, [margins]);

  // Calculates the global Y position where content for a given page number should start
  const getPageContentStartY = useCallback((pageNumber: number) => {
    const pageIndex = pageNumber - 1;
    const marginTopPx = margins.top * 96;
    // Each page occupies A4_CONFIG.HEIGHT + PAGE_SEPARATOR_HEIGHT space
    const totalPageSpacing = A4_CONFIG.HEIGHT + PAGE_SEPARATOR_HEIGHT;
    return pageIndex * totalPageSpacing + marginTopPx;
  }, [margins]);

  // Measures the height and offset of each direct child node within the editor content
  const measureNodes = useCallback((): NodeMeasurement[] => {
    const editorElement = document.querySelector('.editor-content');
    if (!editorElement) {
      if (options?.debugMode) console.warn('Editor content element not found for measurement.');
      return [];
    }

    const measurements: NodeMeasurement[] = [];
    const childNodes = Array.from(editorElement.children) as HTMLElement[];
    const editorRect = editorElement.getBoundingClientRect(); // Get editor's position for relative offsetTop

    childNodes.forEach((node) => {
      // Ensure we're only processing actual HTMLElement nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const computedStyle = window.getComputedStyle(node);
        const nodeMarginTop = parseFloat(computedStyle.marginTop) || 0;
        const nodeMarginBottom = parseFloat(computedStyle.marginBottom) || 0;

        const rect = node.getBoundingClientRect();
        
        const tagName = node.tagName.toLowerCase();
        // Check for table elements (direct or containing a table)
        const isTable = tagName === 'table' || (node.querySelector && node.querySelector('table') !== null);
        // Check for image elements (direct or containing an image)
        const isImage = tagName === 'img' || (node.querySelector && node.querySelector('img') !== null);
        
        measurements.push({
          element: node,
          // Total vertical space taken by the element including its own margins
          height: rect.height + nodeMarginTop + nodeMarginBottom,
          // Offset relative to the editor container's top
          offsetTop: rect.top - editorRect.top,
          // Check for explicit page break markers
          pageBreak: node.classList.contains('page-break') || node.dataset.pageBreak === 'true',
          isTable,
          isImage,
        });
      }
    });
    return measurements;
  }, [options?.debugMode]);

  // Logic to determine if an element should try to stay on one page
  const shouldKeepTogether = useCallback((measurement: NodeMeasurement, availableHeight: number): boolean => {
    const { height, isTable, isImage } = measurement;
    
    // If a table is less than 80% of available page height, try to keep it together
    if (isTable && height < availableHeight * 0.8) {
      return true;
    }
    
    // If an image is less than 60% of available page height, try to keep it together
    if (isImage && height < availableHeight * 0.6) {
      return true;
    }
    return false;
  }, []);

  // Main pagination calculation logic
  const calculatePagination = useCallback(() => {
    setIsRecalculating(true);
    const tempElementsWithMarginTop = new Set<number>(); // Temporary set for current calculation

    try {
      const measurements = measureNodes();
      const availablePageContentHeight = getAvailablePageHeight();
      const newPages: PageInfo[] = [];

      // Reset all custom top margins from previous calculations to get accurate measurements
      measurements.forEach(m => {
        m.element.style.marginTop = '0px'; // Explicitly set to 0px
      });

      if (options?.debugMode) {
        console.log('--- Starting Pagination Calculation ---');
        console.log('Measurements (initial):', measurements);
        console.log('Available content height per page:', availablePageContentHeight);
      }

      let currentPageHeight = 0; // Tracks the content height accumulated on the current page
      let currentPage = 1;      // Current page number
      // absoluteContentTop tracks the global Y position where the content for the *current logical block* starts.
      // It resets to the top of the new page's content area after a page break.
      let absoluteContentTop = margins.top * 96; 

      // Add the first page info
      newPages.push({
        pageNumber: currentPage,
        startY: getPageContentStartY(currentPage),
        endY: getPageContentStartY(currentPage) + availablePageContentHeight,
        contentHeight: 0, // Will be updated as content is added
      });

      measurements.forEach((measurement, index) => {
        const { element, height, pageBreak } = measurement;

        // --- Handle forced page breaks ---
        if (pageBreak) {
          if (options?.debugMode) console.log(`Node ${index}: Forced Page Break detected.`);

          // Ensure the current page's content height is recorded before moving on
          if (newPages[currentPage - 1]) {
            newPages[currentPage - 1].contentHeight = currentPageHeight;
          }

          currentPage++; // Increment page number
          const nextPageContentStartY = getPageContentStartY(currentPage); // Global Y start of the NEXT page's content area
          const currentAbsoluteContentEnd = absoluteContentTop + currentPageHeight; // Global Y end of current content

          // Calculate margin needed to push this element to the start of the next page's content area
          const marginTopNeeded = nextPageContentStartY - currentAbsoluteContentEnd;

          if (marginTopNeeded > 0) {
            element.style.marginTop = `${marginTopNeeded}px`;
            tempElementsWithMarginTop.add(index);
            if (options?.debugMode) {
              console.log(`Node ${index} (forced break): Applied marginTop ${marginTopNeeded}px.`);
            }
          } else {
            // If marginTopNeeded is negative or zero, it means the element is already past or at the start
            // of where it should be on the next page. This can happen if previous elements were very large.
            // In this case, we just place it at the beginning of the new page.
            element.style.marginTop = '0px'; // Ensure no negative margin applied
            if (options?.debugMode) {
              console.log(`Node ${index} (forced break): No positive margin needed, setting to 0px.`);
            }
          }

          // Reset for the new page
          absoluteContentTop = nextPageContentStartY; // New content block starts here
          currentPageHeight = height; // This element is the first on the new page, contributing its height

          newPages.push({
            pageNumber: currentPage,
            startY: getPageContentStartY(currentPage),
            endY: getPageContentStartY(currentPage) + availablePageContentHeight,
            contentHeight: 0,
          });
          return; // Move to the next measurement
        }

        // --- Handle content overflow ---
        // theoreticalPositionOnCurrentPage is the Y position this element would occupy relative to the
        // current page's *content start*.
        // It's calculated as the absolute position of the end of the *previous* content block,
        // minus the absolute start of the *current page's content area*.
        const theoreticalPositionOnCurrentPage = (absoluteContentTop + currentPageHeight) - getPageContentStartY(currentPage);
        
        const wouldOverflow = theoreticalPositionOnCurrentPage + height > availablePageContentHeight;
        
        // Don't break if it's the very first element and too tall for one page,
        // or if it fits and should be kept together (e.g., small tables/images).
        if (wouldOverflow && index !== 0 && !shouldKeepTogether(measurement, availablePageContentHeight)) {
          if (options?.debugMode) {
            console.log(`Node ${index}: Overflow detected. Current page content end: ${availablePageContentHeight}, theoretical end: ${theoreticalPositionOnCurrentPage + height}`);
          }

          // Update current page content height before moving element
          if (newPages[currentPage - 1]) {
            newPages[currentPage - 1].contentHeight = currentPageHeight;
          }

          currentPage++; // Increment page number
          const nextPageContentStartY = getPageContentStartY(currentPage); // Global Y start of the NEXT page's content area
          const currentAbsoluteContentEnd = absoluteContentTop + currentPageHeight; // Global Y end of current content

          // Calculate margin needed to push this element to the start of the next page's content area
          // Corrected calculation: direct difference
          const marginTopNeeded = nextPageContentStartY - currentAbsoluteContentEnd;

          if (marginTopNeeded > 0) {
            element.style.marginTop = `${marginTopNeeded}px`;
            tempElementsWithMarginTop.add(index);
            if (options?.debugMode) {
              console.log(`Node ${index} (overflow break): Applied marginTop ${marginTopNeeded}px.`);
            }
          } else {
             element.style.marginTop = '0px';
             if (options?.debugMode) {
              console.log(`Node ${index} (overflow break): No positive margin needed, setting to 0px.`);
            }
          }

          // Reset for the new page
          absoluteContentTop = nextPageContentStartY; // New content block starts here
          currentPageHeight = height; // This element is the first on the new page, contributing its height

          newPages.push({
            pageNumber: currentPage,
            startY: getPageContentStartY(currentPage),
            endY: getPageContentStartY(currentPage) + availablePageContentHeight,
            contentHeight: 0,
          });

        } else {
          // Element fits on current page or is first element that overflows (handled by subsequent page)
          element.style.marginTop = '0px'; // Ensure no lingering margin
          currentPageHeight += height;
          if (options?.debugMode) {
            console.log(`Node ${index}: Fits on current page. Current page height: ${currentPageHeight}`);
          }
        }
      });

      // Update content height for the very last page
      if (newPages[currentPage - 1]) {
        newPages[currentPage - 1].contentHeight = currentPageHeight;
      }

      if (options?.debugMode) {
        console.log('--- Pagination Calculation Complete ---');
        console.log('Final pages:', newPages);
        newPages.forEach((page, index) => {
          console.log(`Page ${page.pageNumber}: startY=${page.startY}, endY=${page.endY}, contentHeight=${page.contentHeight}`);
        });
        console.log('Elements with applied margin-top indices:', Array.from(tempElementsWithMarginTop));
      }

      setPages(newPages);
      setElementsWithMarginTop(tempElementsWithMarginTop); // Update state with the new set
    } catch (error) {
      console.error('Error calculating pagination:', error);
    } finally {
      setIsRecalculating(false);
    }
  }, [measureNodes, getAvailablePageHeight, getPageContentStartY, margins, options?.debugMode, shouldKeepTogether]);

  // Effect to trigger recalculation with a delay, debouncing multiple rapid updates
  const recalculateWithDelay = useCallback(() => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }
    measurementTimeoutRef.current = setTimeout(() => {
      calculatePagination();
    }, 150); // Slightly longer delay for stability after DOM mutations
  }, [calculatePagination]);

  // Effect to observe resizing of the editor content element
  useEffect(() => {
    const editorElement = document.querySelector('.editor-content');
    if (!editorElement) {
      if (options?.debugMode) console.warn('Editor content element not found for ResizeObserver.');
      return;
    }

    // Disconnect previous observer if it exists
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    // Create a new ResizeObserver and observe the editor element
    resizeObserverRef.current = new ResizeObserver(() => {
      if (options?.debugMode) console.log('Editor content resized, recalculating pagination...');
      recalculateWithDelay();
    });

    resizeObserverRef.current.observe(editorElement);

    // Cleanup: Disconnect observer on component unmount
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [recalculateWithDelay, options?.debugMode]);

  // Effect to listen for Lexical editor updates and initial calculation
  useEffect(() => {
    if (!editor) {
      if (options?.debugMode) console.warn('Lexical editor instance not provided.');
      return;
    }

    // Perform an initial calculation when the editor or margins change
    recalculateWithDelay();

    // Register a listener for Lexical editor state updates
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      // Read the editor state to trigger a DOM update, then recalculate
      editorState.read(() => {
        recalculateWithDelay();
      });
    });

    // Cleanup: Unregister listener and clear timeout on component unmount
    return () => {
      unregisterUpdateListener();
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
      }
    };
  }, [editor, margins, recalculateWithDelay, options?.debugMode]); // Depend on editor and margins

  return {
    pages,
    isRecalculating,
    recalculate: calculatePagination, // Expose recalculate function for manual triggers
    availableHeight: getAvailablePageHeight(), // Expose available content height
    totalPages: pages.length,           // Expose total number of pages
    elementsWithMarginTop,             // New: Expose indices of elements that got margin-top
  };
};  