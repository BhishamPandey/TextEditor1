import React from 'react';
import './CenterAlign.scss';
import { AlignCenterIcon } from '../Icons/Icons';

interface CenterAlignProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const CenterAlign: React.FC<CenterAlignProps> = ({
  editorRef,
  // lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const handleCenterAlign = () => {
  
    if (editorRef.current) {
      editorRef.current.focus();
      
      if (restoreSelection) {
          restoreSelection();
      }
      
      applyCenterAlign();
      
      if (saveSelection) {
          saveSelection();
      }
      
      if (onContentChange) {
          onContentChange();
      }
    }
  };

  const applyCenterAlign = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    const blockElements = findBlockElements(range);
    
    blockElements.forEach(element => {
      element.style.textAlign = 'center';
    });
  };

  const findBlockElements = (range: Range): HTMLElement[] => {
    const blockElements: HTMLElement[] = [];
    
    if (range.collapsed) {
      let node = range.startContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }

      while (node && node !== editorRef.current) {
        if (isBlockElement(node as HTMLElement)) {
          blockElements.push(node as HTMLElement);
          break;
        }
        node = node.parentNode as Node;
      }
      
      if (blockElements.length === 0 && editorRef.current) {
        const closestParagraph = findOrCreateParagraph(range.startContainer, range.startOffset);
        if (closestParagraph) {
          blockElements.push(closestParagraph);
        }
      }
    } else {

      const tempDiv = document.createElement('div');
      tempDiv.appendChild(range.cloneContents());
      
      const directBlocks = Array.from(tempDiv.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, blockquote, pre'));
      
      if (directBlocks.length > 0) {
        directBlocks.forEach(clonedBlock => {

          const blockSelector = clonedBlock.nodeName.toLowerCase();
          let startNode = range.startContainer;

          while (startNode && startNode !== editorRef.current) {
            if (startNode.nodeName.toLowerCase() === blockSelector) {
              blockElements.push(startNode as HTMLElement);
              break;
            }
            startNode = startNode.parentNode as Node;
          }
        });
      } else {

        const ancestor = range.commonAncestorContainer;
        if (ancestor && ancestor !== editorRef.current) {
          if (ancestor.nodeType === Node.TEXT_NODE) {
            const parent = ancestor.parentNode as HTMLElement;
            if (isBlockElement(parent)) {
              blockElements.push(parent);
            }
          } else if (isBlockElement(ancestor as HTMLElement)) {
            blockElements.push(ancestor as HTMLElement);
          }
        }
      }
      
      if (blockElements.length === 0 && editorRef.current) {
   
        const fragment = range.extractContents();
        
        const newParagraph = document.createElement('p');
        newParagraph.style.textAlign = 'center';
        
        newParagraph.appendChild(fragment);
        
        range.insertNode(newParagraph);
        
        const currentSelection = window.getSelection();
        if (currentSelection) {
          currentSelection.removeAllRanges();
          const newRange = document.createRange();
          newRange.setStartAfter(newParagraph);
          newRange.setEndAfter(newParagraph);
          currentSelection.addRange(newRange);
        }
        
        blockElements.push(newParagraph);
      }
    }
    
    return blockElements;
  };

  const isBlockElement = (element: HTMLElement): boolean => {
    const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI'];
    return blockTags.includes(element.nodeName);
  };

  const findOrCreateParagraph = (node: Node, offset: number): HTMLElement | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      let parent = node.parentNode;
      while (parent && parent !== editorRef.current) {
        if (parent.nodeName === 'P') {
          return parent as HTMLElement;
        }
        parent = parent.parentNode;
      }
    }
    
    if (editorRef.current) {
      const currentSelection = window.getSelection();
      if (!currentSelection) return null;
      
      const range = currentSelection.getRangeAt(0);
      
      const newParagraph = document.createElement('p');
      
      if (!range.collapsed) {
        const fragment = range.extractContents();
        newParagraph.appendChild(fragment);
      } else {
        newParagraph.innerHTML = '<br>';
      }
      
      range.insertNode(newParagraph);
      
      currentSelection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStart(newParagraph, 0);
      newRange.setEnd(newParagraph, 0);
      currentSelection.addRange(newRange);
      
      return newParagraph;
    }
    
    return null;
  };

  return (
    <button 
      className="center-align-button"
      onClick={handleCenterAlign}
      title="Center Align"
    >
<AlignCenterIcon height={28} width={28} className='AlignCenterIcon'/>
    </button>
  );
};

export default CenterAlign;