// plugins/PageBreakNode.ts
import {
  DecoratorNode,
  EditorConfig,
  NodeKey,
  SerializedLexicalNode
} from "lexical";
import React, { JSX } from "react";

export class PageBreakNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "pagebreak";
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");

    // Safe extraction of custom margins from theme
    const margins = config.theme?.margins as { top?: number; bottom?: number } | undefined;
    const topMargin = margins?.top ?? 1;
    const bottomMargin = margins?.bottom ?? 1;

    div.className = "page-break-node";

    div.style.height = "100px";
    div.style.width = "794px";

    // horizontal margin fixed, vertical dynamic
    div.style.margin = `0 -96px ${bottomMargin * 96}px -96px`;
    div.style.marginTop = `${topMargin * 96}px`;

    div.style.background = "#fafafa";
    div.style.borderLeft = "1px solid #FCFCFC";
    div.style.borderRight = "1px solid #FCFCFC";
    div.style.textAlign = "center";
    div.style.zIndex = "100";

    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return React.createElement('div');
  }

  static importJSON(): PageBreakNode {
    return new PageBreakNode();
  }

  exportJSON(): SerializedLexicalNode {
    return {
      type: "pagebreak",
      version: 1,
    };
  }

  isInline(): boolean {
    return false;
  }

  isIsolated(): boolean {
    return true;
  }

  isTopLevel(): boolean {
    return true;
  }
}

export function $createPageBreakNode(): PageBreakNode {
  return new PageBreakNode();
}
