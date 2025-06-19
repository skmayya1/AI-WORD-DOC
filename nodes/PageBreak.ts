// import {
//   ElementNode,
//   SerializedElementNode,
//   NodeKey,
//   $applyNodeReplacement
// } from "lexical";

// type Padding = {
//   top: number;
//   right: number;
//   bottom: number;
//   left: number;
// };

// export class PageNode extends ElementNode {
//   __padding: Padding;

//   constructor(padding: Padding = { top: 60, right: 60, bottom: 60, left: 60 }, key?: NodeKey) {
//     super(key);
//     this.__padding = padding;
//   }

//   static getType(): string {
//     return "page";  
//   }

//   static clone(node: PageNode): PageNode {
//     return new PageNode(node.__padding, node.__key);
//   }

//   createDOM(): HTMLElement {
//     const div = document.createElement("div");
//     div.className = "select-text outline-0 w-[794px] editor z-0 bg-white h-[1123px] border overflow-hidden";
//     this.applyPaddingStyle(div);
//     return div;
//   }

//   updateDOM(prevNode: PageNode, dom: HTMLElement): boolean {
//     if (JSON.stringify(prevNode.__padding) !== JSON.stringify(this.__padding)) {
//       this.applyPaddingStyle(dom);
//       return true;
//     }
//     return false;
//   }

//   applyPaddingStyle(dom: HTMLElement) {
//     dom.style.paddingTop = `${this.__padding.top * 96}px`;
//     dom.style.paddingRight = `${this.__padding.right  * 96}px`;
//     dom.style.paddingBottom = `${this.__padding.bottom  * 96}px`;
//     dom.style.paddingLeft = `${this.__padding.left  * 96}px`; 
//   }

//   static importJSON(serializedNode: SerializedElementNode & { padding?: Padding }): PageNode {
//     const node = new PageNode(serializedNode.padding || { top: 60, right: 60, bottom: 60, left: 60 });
//     node.setFormat(serializedNode.format);
//     return node;
//   }

//   exportJSON(): SerializedElementNode & { padding: Padding } {
//     return {
//       ...super.exportJSON(),
//       type: "page",
//       version: 1,
//       padding: this.__padding,
//     };
//   }
//   canContainText(): boolean {
//     return true;
//   }
//   isInline(): boolean {
//     return false;
//   }
// }

// export function $createPageNode(padding?: Padding): PageNode {
//   return $applyNodeReplacement(new PageNode(padding));
// }

// export function $isPageNode(node: unknown): node is PageNode {
//   return node instanceof PageNode;
// }
