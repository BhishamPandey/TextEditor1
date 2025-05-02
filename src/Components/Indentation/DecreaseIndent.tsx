import React, { useRef, useState, useEffect } from 'react';
import './DecreaseIndent.scss';
import { DecreaseIndentIcon } from '../Icons/Icons';

interface DecreaseIndentProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection?: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const DecreaseIndent: React.FC<DecreaseIndentProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Check if the current selection has enough indentation to decrease
  const checkIfCanDecreaseIndent = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If we have a lastSelection saved, use that instead
      if (lastSelection) {
        checkDecreasableIndentationForRange(lastSelection);
      }
      return;
    }
    
    const range = selection.getRangeAt(0);
    checkDecreasableIndentationForRange(range);
  };
  
  const checkDecreasableIndentationForRange = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    let canDecreaseIndent = false;
    
    if (range.collapsed) {
      const currentBlock = findClosestBlockElement(range.startContainer);
      
      if (currentBlock) {
        const currentMargin = parseInt(window.getComputedStyle(currentBlock).marginLeft) || 0;
        canDecreaseIndent = currentMargin > 0;
      }
    } else {
      const affectedBlocks = findAffectedBlocks(commonAncestor, range);
      
      if (affectedBlocks.length === 0) {
        const parentBlock = findClosestBlockElement(range.startContainer) || 
                           findClosestBlockElement(range.endContainer);
        
        if (parentBlock) {
          const currentMargin = parseInt(window.getComputedStyle(parentBlock).marginLeft) || 0;
          canDecreaseIndent = currentMargin > 0;
        }
      } else {
        // Check if any of the affected blocks have indentation that can be decreased
        canDecreaseIndent = affectedBlocks.some(block => {
          const currentMargin = parseInt(window.getComputedStyle(block).marginLeft) || 0;
          return currentMargin > 0;
        });
      }
    }
    
    setIsActive(canDecreaseIndent);
  };
  
  // Add event listener to update isActive state when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      checkIfCanDecreaseIndent();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Initial check
    checkIfCanDecreaseIndent();
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef, lastSelection]);
  
  // Update isActive state when content changes
  useEffect(() => {
    if (onContentChange) {
      const originalOnContentChange = onContentChange;
      const wrappedOnContentChange = () => {
        originalOnContentChange();
        checkIfCanDecreaseIndent();
      };
      
      // This is just to register the dependency correctly
      // We're not actually replacing onContentChange
    }
  }, [onContentChange]);
  
  const handleDecreaseIndent = () => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    if (restoreSelection) {
      restoreSelection();
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    decreaseIndentForRange(range);
    
    if (onContentChange) {
      onContentChange();
    }
    
    if (saveSelection) {
      saveSelection();
    }
    
    // Update isActive state after decreasing indentation
    checkIfCanDecreaseIndent();
  };
  
  const decreaseIndentForRange = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    
    if (range.collapsed) {
      let currentBlock = findClosestBlockElement(range.startContainer);
      
      if (currentBlock) {
        const currentMargin = parseInt(window.getComputedStyle(currentBlock).marginLeft) || 0;
        if (currentMargin >= 40) {
          currentBlock.style.marginLeft = `${currentMargin - 40}px`;
        } else if (currentMargin > 0) {
          currentBlock.style.marginLeft = '0';
        }
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
        if (currentMargin >= 40) {
          parentBlock.style.marginLeft = `${currentMargin - 40}px`;
        } else if (currentMargin > 0) {
          parentBlock.style.marginLeft = '0';
        }
      }

      return;
    }
    
    affectedBlocks.forEach(block => {
      const currentMargin = parseInt(window.getComputedStyle(block).marginLeft) || 0;
      
      if (currentMargin >= 40) {
        block.style.marginLeft = `${currentMargin - 40}px`;
      } else if (currentMargin > 0) {
        block.style.marginLeft = '0';
      }
    });
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
  
  return (
    <button
      ref={buttonRef}
      className={`decrease-indent-button ${isActive ? 'active' : ''}`}
      onClick={handleDecreaseIndent}
      title="Decrease Indent"
      aria-label="Decrease Indentation"
    >
      <DecreaseIndentIcon height={28} width={28} className={`DecreaseIndentIcon ${isActive ? 'active' : ''}`} />
    </button>
  );
};

export default DecreaseIndent;