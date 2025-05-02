import React, { useRef, useState, useEffect } from 'react';
import './IncreaseIndent.scss';
import { IncreaseIndentIcon } from '../Icons/Icons';

interface IncreaseIndentProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection?: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const IncreaseIndent: React.FC<IncreaseIndentProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  const checkIfIndented = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      if (lastSelection) {
        checkIndentationForRange(lastSelection);
      }
      return;
    }    
    const range = selection.getRangeAt(0);
    checkIndentationForRange(range);
  };
  
  const checkIndentationForRange = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    let hasIndentation = false;
    
    if (range.collapsed) {
      const currentBlock = findClosestBlockElement(range.startContainer);
      
      if (currentBlock) {
        const currentMargin = parseInt(window.getComputedStyle(currentBlock).marginLeft) || 0;
        hasIndentation = currentMargin > 0;
      }
    } else {
      const affectedBlocks = findAffectedBlocks(commonAncestor, range);
      
      if (affectedBlocks.length === 0) {
        const parentBlock = findClosestBlockElement(range.startContainer) || 
                           findClosestBlockElement(range.endContainer);
        
        if (parentBlock) {
          const currentMargin = parseInt(window.getComputedStyle(parentBlock).marginLeft) || 0;
          hasIndentation = currentMargin > 0;
        }
      } else {
        // Check if any of the affected blocks have indentation
        hasIndentation = affectedBlocks.some(block => {
          const currentMargin = parseInt(window.getComputedStyle(block).marginLeft) || 0;
          return currentMargin > 0;
        });
      }
    }
    
    setIsActive(hasIndentation);
  };
  
  useEffect(() => {
    const handleSelectionChange = () => {
      checkIfIndented();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    checkIfIndented();
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef, lastSelection]);
  
  useEffect(() => {
    if (onContentChange) {
      const originalOnContentChange = onContentChange;
      const wrappedOnContentChange = () => {
        originalOnContentChange();
        checkIfIndented();
      };
      
    }
  }, [onContentChange]);
  
  const handleIncreaseIndent = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    if (restoreSelection) {
      restoreSelection();
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    increaseIndentForRange(range);
    
    if (onContentChange) {
      onContentChange();
    }
    
    if (saveSelection) {
      saveSelection();
    }
    
    checkIfIndented();
  };
  
  const increaseIndentForRange = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    
    if (range.collapsed) {
      let currentBlock = findClosestBlockElement(range.startContainer);
      
      if (currentBlock) {
        const currentMargin = parseInt(window.getComputedStyle(currentBlock).marginLeft) || 0;
        currentBlock.style.marginLeft = `${currentMargin + 40}px`;
        return;
      }      
      return;
    }
    
    const affectedBlocks = findAffectedBlocks(commonAncestor, range);

    if (affectedBlocks.length === 0 && !range.collapsed) {
      let parentBlock = findClosestBlockElement(range.startContainer) || 
                         findClosestBlockElement(range.endContainer);
      
      if (parentBlock) {
        const currentMargin = parseInt(window.getComputedStyle(parentBlock).marginLeft) || 0;
        parentBlock.style.marginLeft = `${currentMargin + 40}px`;
      } else {
        const fragment = range.extractContents();
        const newParagraph = document.createElement('p');
        newParagraph.style.marginLeft = '40px'; 
        newParagraph.appendChild(fragment);
        range.insertNode(newParagraph);
        
        range.selectNodeContents(newParagraph);
        range.collapse(false);
        const newSelection = window.getSelection();
        if (newSelection) {
          newSelection.removeAllRanges();
          newSelection.addRange(range);
        }
      }
      return;
    }
    
    affectedBlocks.forEach(block => {
      const currentMargin = parseInt(window.getComputedStyle(block).marginLeft) || 0;
      
      block.style.marginLeft = `${currentMargin + 40}px`;
    });
  };
  
  const findClosestBlockElement = (node: Node): HTMLElement | null => {
    let current: Node | null = node;
    
    while (current && current !== editorRef.current) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        
        if (computedStyle.display === 'block' || 
            element.nodeName === 'P' || 
            element.nodeName === 'DIV' || 
            element.nodeName === 'H1' || 
            element.nodeName === 'H2' || 
            element.nodeName === 'H3' || 
            element.nodeName === 'H4' || 
            element.nodeName === 'H5' || 
            element.nodeName === 'H6' || 
            element.nodeName === 'LI' ||
            element.nodeName === 'BLOCKQUOTE') {
          return element;
        }
      }
      current = current.parentNode;
    }
    
    return null;
  };
  
  const findAffectedBlocks = (node: Node, range: Range): HTMLElement[] => {
    const blocks: HTMLElement[] = [];
    
    const isBlockElement = (node: Node): boolean => {
      if (node.nodeType !== Node.ELEMENT_NODE) return false;
      
      const element = node as HTMLElement;
      const computedStyle = window.getComputedStyle(element);
      
      return computedStyle.display === 'block' || 
             element.nodeName === 'P' || 
             element.nodeName === 'DIV' || 
             element.nodeName === 'H1' || 
             element.nodeName === 'H2' || 
             element.nodeName === 'H3' || 
             element.nodeName === 'H4' || 
             element.nodeName === 'H5' || 
             element.nodeName === 'H6' || 
             element.nodeName === 'LI' ||
             element.nodeName === 'BLOCKQUOTE';
    };
    
    const findBlocksInNode = (node: Node) => {
      if (!range.intersectsNode(node)) return;
      
      if (isBlockElement(node)) {
        blocks.push(node as HTMLElement);
        return;
      }
      
      for (let i = 0; i < node.childNodes.length; i++) {
        findBlocksInNode(node.childNodes[i]);
      }
    };
    
    if (node.nodeType === Node.ELEMENT_NODE && isBlockElement(node)) {
      blocks.push(node as HTMLElement);
    } else {
      findBlocksInNode(node);
    }
    
    return blocks;
  };
  
  return (
    <button
      ref={buttonRef}
      className={`increase-indent-button ${isActive ? 'active' : ''}`}
      onClick={handleIncreaseIndent}
      title="Increase Indent"
      aria-label="Increase Indentation"
    >
      <IncreaseIndentIcon height={28} width={28} className={`IndentIcon ${isActive ? 'active' : ''}`}/>
    </button>
  );
};

export default IncreaseIndent;