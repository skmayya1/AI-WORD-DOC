// components/ReportViewer.tsx
"use client";

import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { useEditorContext } from '@/contexts/EditorContext';
import { $getRoot, LexicalNode, $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import PageBreakPlugin from '@/plugins/PageBreakPlugin';
import { PageBreakNode } from '@/nodes/PageBreak';

const A4_SIZEPX = {
  HEIGHT: 1123,
  WIDTH: 794
};

interface Page {
  id: number;
  startIndex: number;
  endIndex: number;
  height: number;
  overflow: boolean;
}

interface VirtualPaginationPluginProps {
  margins: { top: number; bottom: number; left: number; right: number };
  onPagesChange: (pages: Page[]) => void;
  onCurrentPageChange: (pageIndex: number) => void;
  editorRef: React.RefObject<HTMLDivElement>;
}

// Virtual Pagination Plugin with enhanced navigation control
function VirtualPaginationPlugin({ margins, onPagesChange, onCurrentPageChange, editorRef }: VirtualPaginationPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isCalculating, setIsCalculating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [pageGaps, setPageGaps] = useState<Array<{start: number, end: number}>>([]);
  const pagesRef = useRef<Page[]>([]);
  
  const calculatePages = useCallback(() => {
    if (isCalculating) return;
    
    setIsCalculating(true);
    
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const children = root.getChildren();
      
      if (children.length === 0) {
        const defaultPage = [{ id: 1, startIndex: 0, endIndex: 0, height: 0, overflow: false }];
        pagesRef.current = defaultPage;
        onPagesChange(defaultPage);
        setIsCalculating(false);
        return;
      }
      
      const pages: Page[] = [];
      const contentHeight = A4_SIZEPX.HEIGHT - (margins.top + margins.bottom) * 96;
      let currentHeight = 0;
      let pageStartIndex = 0;
      
      children.forEach((node, index) => {
        const nodeHeight = estimateNodeHeight(node);
        
        // Check if adding this node would exceed page height
        if (currentHeight + nodeHeight > contentHeight && index > pageStartIndex) {
          // Create current page
          pages.push({
            id: pages.length + 1,
            startIndex: pageStartIndex,
            endIndex: index - 1,
            height: currentHeight,
            overflow: currentHeight > contentHeight
          });
          
          // Start new page
          pageStartIndex = index;
          currentHeight = nodeHeight;
        } else {
          currentHeight += nodeHeight;
        }
      });
      
      // Add the last page
      pages.push({
        id: pages.length + 1,
        startIndex: pageStartIndex,
        endIndex: children.length - 1,
        height: currentHeight,
        overflow: currentHeight > contentHeight
      });
      
      // Ensure at least one page exists
      if (pages.length === 0) {
        pages.push({ id: 1, startIndex: 0, endIndex: 0, height: 0, overflow: false });
      }
      
      pagesRef.current = pages;
      onPagesChange(pages);
      
      // Calculate page gaps (areas between pages where user shouldn't type)
      const gaps: Array<{start: number, end: number}> = [];
      pages.forEach((page, index) => {
        if (index < pages.length - 1) {
          const gapStart = (margins.top + margins.bottom) * 96 + 
                          (index + 1) * A4_SIZEPX.HEIGHT + 
                          index * 24;
          const gapEnd = gapStart + 24; // 24px gap
          gaps.push({ start: gapStart, end: gapEnd });
        }
      });
      setPageGaps(gaps);
      
      // Determine current page based on cursor position
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const focusNode = selection.focus.getNode();
        const nodeIndex = children.findIndex(child => child === focusNode || child.isParentOf(focusNode));
        
        if (nodeIndex >= 0) {
          const currentPageIndex = pages.findIndex(page => 
            nodeIndex >= page.startIndex && nodeIndex <= page.endIndex
          );
          if (currentPageIndex >= 0) {
            onCurrentPageChange(currentPageIndex);
          }
        }
      }
      
      setIsCalculating(false);
    });
  }, [editor, margins, onPagesChange, onCurrentPageChange, isCalculating]);
  
  const debouncedCalculate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      calculatePages();
    }, 150);
  }, [calculatePages]);

  // Enhanced navigation control function
  const handleSmartNavigation = useCallback((key: string, isAtEnd: boolean, isAtStart: boolean) => {
    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      const selection = $getSelection();
      
      if (!$isRangeSelection(selection) || children.length === 0) return;
      
      const currentNode = selection.focus.getNode();
      const currentIndex = children.findIndex(child => 
        child === currentNode || child.isParentOf(currentNode)
      );
      
      if (currentIndex === -1) return;
      
      // Find current page
      const currentPageIndex = pagesRef.current.findIndex(page => 
        currentIndex >= page.startIndex && currentIndex <= page.endIndex
      );
      
      if (currentPageIndex === -1) return;
      
      const currentPage = pagesRef.current[currentPageIndex];
      
      if (key === 'Enter' && isAtEnd && currentIndex === currentPage.endIndex) {
        // At end of page, move to next page or create new content
        if (currentPageIndex < pagesRef.current.length - 1) {
          // Move to start of next page
          const nextPage = pagesRef.current[currentPageIndex + 1];
          if (children[nextPage.startIndex]) {
            children[nextPage.startIndex].selectStart();
          }
        } else {
          // At end of document, create new paragraph
          const newParagraph = $createParagraphNode();
          root.append(newParagraph);
          newParagraph.selectStart();
        }
      } else if (key === 'Backspace' && isAtStart && currentIndex === currentPage.startIndex) {
        // At start of page, move to end of previous page
        if (currentPageIndex > 0) {
          const prevPage = pagesRef.current[currentPageIndex - 1];
          if (children[prevPage.endIndex]) {
            children[prevPage.endIndex].selectEnd();
          }
        }
      }
    });
  }, [editor]);
  
  useEffect(() => {
    // Initial calculation
    setTimeout(calculatePages, 100);
    
    // Recalculate on content changes with debouncing
    const unregister = editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        debouncedCalculate();
      }
    });

    // Handle cursor movements and prevent editing in gaps
    const handleCursorConstraint = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && editorRef.current) {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const editorRect = editorRef.current.getBoundingClientRect();
            const relativeY = rect.top - editorRect.top + editorRef.current.scrollTop;
            
            const isInGap = pageGaps.some(gap => relativeY >= gap.start && relativeY <= gap.end);
            
            if (isInGap) {
              editor.update(() => {
                const root = $getRoot();
                const lastChild = root.getLastChild();
                if (lastChild) {
                  lastChild.selectEnd();
                }
              });
            }
          }
        }
      });
    };

    // Enhanced keyboard handling
    const handleKeyDown = (e: KeyboardEvent) => {
      const selection = editor.getEditorState().read(() => $getSelection());
      
      if (!$isRangeSelection(selection)) return;
      
      // Check if cursor is in gap first
      if (editorRef.current) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();
          const relativeY = rect.top - editorRect.top + editorRef.current.scrollTop;
          
          const isInGap = pageGaps.some(gap => relativeY >= gap.start && relativeY <= gap.end);
          
          if (isInGap && e.key.length === 1) {
            e.preventDefault();
            editor.update(() => {
              const root = $getRoot();
              const lastChild = root.getLastChild();
              if (lastChild) {
                lastChild.selectEnd();
                const newSelection = $getSelection();
                if ($isRangeSelection(newSelection)) {
                  newSelection.insertText(e.key);
                }
              }
            });
            return;
          }
        }
      }
      
      // Handle smart navigation for Enter and Backspace
      if (e.key === 'Enter' || e.key === 'Backspace') {
        const currentNode = selection.focus.getNode();
        const isAtEnd = selection.focus.offset === currentNode.getTextContentSize();
        const isAtStart = selection.focus.offset === 0;
        
        if ((e.key === 'Enter' && isAtEnd) || (e.key === 'Backspace' && isAtStart)) {
          setTimeout(() => {
            handleSmartNavigation(e.key, isAtEnd, isAtStart);
          }, 0);
        }
      }
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('click', handleCursorConstraint);
      editorElement.addEventListener('keyup', handleCursorConstraint);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      unregister();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (editorElement) {
        editorElement.removeEventListener('click', handleCursorConstraint);
        editorElement.removeEventListener('keyup', handleCursorConstraint);
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [calculatePages, debouncedCalculate, pageGaps, editor, handleSmartNavigation]);
  
  return null;
}

// Helper function to estimate node height
function estimateNodeHeight(node: LexicalNode): number {
  const nodeType = node.getType();
  const textContent = node.getTextContent();
  
  switch (nodeType) {
    case 'heading':
      const headingNode = node as any;
      const tag = headingNode.getTag?.() || 'h1';
      const headingSizes: Record<string, number> = {
        h1: 40,
        h2: 32,
        h3: 28,
        h4: 24,
        h5: 22,
        h6: 20
      };
      return (headingSizes[tag] || 24) + 12;
      
    case 'paragraph':
      if (!textContent.trim()) return 20;
      const lines = Math.max(1, Math.ceil(textContent.length / 90));
      return lines * 20 + 4;
      
    case 'list':
    case 'listitem':
      const listLines = Math.max(1, Math.ceil(textContent.length / 85));
      return listLines * 20 + 2;
      
    case 'pagebreak':
      return 0;
      
    default:
      return Math.max(16, Math.ceil(textContent.length / 120) * 18);
  }
}

// Enhanced Page Indicator Component with bottom spacing
interface PageIndicatorProps {
  pageNumber: number;
  isActive: boolean;
  margins: { top: number; bottom: number; left: number; right: number };
  isOverflow: boolean;
}

const PageIndicator: React.FC<PageIndicatorProps> = ({ 
  pageNumber, 
  isActive, 
  margins,
  isOverflow 
}) => {
  return (
    <div 
      className={`absolute left-0 bg-white shadow-lg pointer-events-none transition-all duration-200 ${
        isActive ? 'ring-2 ring-blue-400 shadow-xl z-10' : 'z-0'
      } ${isOverflow ? 'ring-2 ring-red-300' : ''}`}
      style={{
        width: A4_SIZEPX.WIDTH,
        height: A4_SIZEPX.HEIGHT,
        top: (pageNumber - 1) * (A4_SIZEPX.HEIGHT + 24),
      }}
    >
      {/* Page margin guidelines */}
      <div 
        className="absolute border border-dashed border-gray-200 opacity-30"
        style={{
          left: margins.left * 96,
          right: margins.right * 96,
          top: margins.top * 96,
          bottom: margins.bottom * 96,
        }}
      />
      
      {/* Bottom spacing indicator */}
      <div 
        className="absolute border-t border-dashed border-blue-200 opacity-40"
        style={{
          left: margins.left * 96,
          right: margins.right * 96,
          bottom: margins.bottom * 96 + 20, // 20px visual buffer
        }}
      />
      
      {/* Page number */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-500">
        Page {pageNumber}
        {isOverflow && <span className="text-red-500 ml-1">⚠</span>}
      </div>
    </div>
  );
};

// Main ReportViewer Component
interface RichTextEditorProps {}

const ReportViewer: React.FC<RichTextEditorProps> = () => {
  const { margins, editor } = useEditorContext();
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const editorRef = useRef<HTMLDivElement | null>(null);
  
  const handlePagesChange = useCallback((newPages: Page[]) => {
    setPages(newPages);
    console.log(`Document has ${newPages.length} pages`);
  }, []);
  
  const handleCurrentPageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, []);
  
  const scrollToPage = useCallback((pageIndex: number) => {
    if (editorRef.current) {
      const pageTop = pageIndex * (A4_SIZEPX.HEIGHT + 24);
      editorRef.current.scrollTo({
        top: pageTop,
        behavior: 'smooth'
      });
    }
  }, []);
  
  // Calculate total height with bottom spacing buffer
  const totalHeight = pages.length > 0 
    ? pages.length * A4_SIZEPX.HEIGHT + (pages.length - 1) * 24 + 40 // Added 40px bottom buffer
    : A4_SIZEPX.HEIGHT + 40;
  
  return (
    <div className="mx-auto my-14 flex flex-col items-center">
      {/* Page Status Bar */}
      {pages.length > 1 && (
        <div className="mb-4 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
          Pages: {pages.length} | Current: {currentPage + 1} 
          {pages.some(p => p.overflow) && (
            <span className="ml-2 text-amber-600">⚠ Content overflow detected</span>
          )}
        </div>
      )}
      
      {/* Editor Container */}
      <div className="relative" style={{ width: A4_SIZEPX.WIDTH }}>
        {/* Page Indicators with enhanced bottom spacing */}
        <div className="absolute inset-0 pointer-events-none">
          {pages.map((page, index) => (
            <PageIndicator
              key={page.id}
              pageNumber={page.id}
              isActive={currentPage === index}
              margins={margins}
              isOverflow={page.overflow}
            />
          ))}
          
          {/* Gap blockers with improved interaction */}
          {pages.length > 1 && pages.map((_, index) => {
            if (index < pages.length - 1) {
              return (
                <div
                  key={`gap-${index}`}
                  className="absolute left-0 bg-gray-100 pointer-events-auto cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center"
                  style={{
                    width: A4_SIZEPX.WIDTH,
                    height: 24,
                    top: (index + 1) * A4_SIZEPX.HEIGHT + index * 24,
                    zIndex: 30,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    editor.update(() => {
                      const root = $getRoot();
                      const children = root.getChildren();
                      const targetPage = pages[index + 1];
                      if (targetPage && children[targetPage.startIndex]) {
                        children[targetPage.startIndex].selectStart();
                      }
                    });
                  }}
                >
                  <span className="text-xs text-gray-400">Page Break</span>
                </div>
              );
            }
            return null;
          })}
          
          {/* Bottom spacing area for last page */}
          <div
            className="absolute left-0 bg-transparent pointer-events-auto"
            style={{
              width: A4_SIZEPX.WIDTH,
              height: 40,
              top: pages.length * A4_SIZEPX.HEIGHT + (pages.length - 1) * 24,
              zIndex: 20,
            }}
            onClick={() => {
              editor.update(() => {
                const root = $getRoot();
                const lastChild = root.getLastChild();
                if (lastChild) {
                  lastChild.selectEnd();
                } else {
                  const newParagraph = $createParagraphNode();
                  root.append(newParagraph);
                  newParagraph.selectStart();
                }
              });
            }}
          />
        </div>
        
        {/* Single Editor covering all pages with bottom spacing */}
        <div className="relative z-20">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                ref={editorRef}
                className="select-text outline-0 relative"
                style={{
                  paddingLeft: margins.left * 96,
                  paddingRight: margins.right * 96,
                  paddingTop: margins.top * 96,
                  paddingBottom: (margins.bottom * 96) + 40, // Added 40px bottom spacing
                  minHeight: totalHeight - (margins.top + margins.bottom) * 96,
                  width: A4_SIZEPX.WIDTH - (margins.left + margins.right) * 96,
                }}
              />
            }
            placeholder={
              <div 
                className="absolute text-gray-400 pointer-events-none"
                style={{
                  left: margins.left * 96,
                  top: margins.top * 96,
                }}
              >
                Start typing your report...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        
        {/* Plugins */}
        <HistoryPlugin />
        <ListPlugin hasStrictIndent />
        <AutoFocusPlugin />
        <PageBreakPlugin />
        <VirtualPaginationPlugin 
          margins={margins}
          onPagesChange={handlePagesChange}
          onCurrentPageChange={handleCurrentPageChange}
          editorRef={editorRef as RefObject<HTMLDivElement>}
        />
      </div>
      
      {/* Page Navigation */}
      {pages.length > 1 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 z-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const newPage = Math.max(0, currentPage - 1);
                setCurrentPage(newPage);
                scrollToPage(newPage);
              }}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage + 1} / {pages.length}
            </span>
            <button
              onClick={() => {
                const newPage = Math.min(pages.length - 1, currentPage + 1);
                setCurrentPage(newPage);
                scrollToPage(newPage);
              }}
              disabled={currentPage === pages.length - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportViewer;