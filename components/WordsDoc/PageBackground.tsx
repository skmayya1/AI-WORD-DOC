// import React from 'react';

// interface PageBackgroundsProps {
//   pages: Array<{ pageNumber: number; startY: number; endY: number }>;
//   width?: number;
//   height?: number;
//   separatorHeight?: number;
// }

// export const PageBackgrounds: React.FC<PageBackgroundsProps> = ({ 
//   pages, 
//   width = 794, 
//   height = 1123,
//   separatorHeight = 1
// }) => {
//   // Calculate page background position based on page number, not startY
//   const getPageBackgroundTop = (pageNumber: number) => {
//     const pageIndex = pageNumber - 1;
//     const totalPageSpacing = height + separatorHeight;
//     return pageIndex * totalPageSpacing;
//   };

//   return (
//     <div className="absolute inset-0 pointer-events-none z-0">
//       {pages.map((page) => (
//         <div
//           key={page.pageNumber}
//           className="absolute bg-white border border-gray-300 shadow-lg"
//           style={{
//             width: `${width}px`,
//             height: `${height}px`,
//             top: `${getPageBackgroundTop(page.pageNumber)}px`,
//             left: '50%',
//             transform: 'translateX(-50%)',
//             boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
//           }}
//         >
//           {/* Optional page number */}
//           <div className="absolute bottom-2 right-4 text-xs text-gray-400">
//             Page {page.pageNumber}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };