import React from 'react';
import './Format.scss';
import { FormatTextIcon } from '../Icons/Icons';

interface FormatProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
}

const Format: React.FC<FormatProps> = ({
  editorRef,
  // lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  
  const handleClearFormatting = () => {
    if (!editorRef.current) return;
    
    restoreSelection();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    if (range.collapsed) return;
    
    clearFormatting(range);
    
    saveSelection();
    onContentChange();
  };
  
  const clearFormatting = (range: Range) => {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      const formattedParents: HTMLElement[] = [];
      let currentNode: Node | null = startContainer;
      
      while (currentNode && currentNode !== editorRef.current) {
        if (
          currentNode.nodeType === Node.ELEMENT_NODE && 
          ['SPAN', 'B', 'I', 'U', 'STRONG', 'EM'].includes((currentNode as HTMLElement).tagName)
        ) {
          formattedParents.push(currentNode as HTMLElement);
        }
        currentNode = currentNode.parentNode;
      }
      
      if (formattedParents.length > 0) {
        splitNestedFormattedParents(formattedParents, startContainer as Text, startOffset, endOffset);
      } else {
        const textNode = startContainer as Text;
        const selectedText = textNode.textContent?.substring(startOffset, endOffset) || '';
        range.deleteContents();
        range.insertNode(document.createTextNode(selectedText));
      }
    } else {

      handleComplexSelection(range);
    }
    
    if (editorRef.current) {
      cleanupEmptyElements(editorRef.current);
    }
  };
  
  const handleComplexSelection = (range: Range) => {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    const startParagraph = findParentByTagName(startContainer, 'P');
    const endParagraph = findParentByTagName(endContainer, 'P');
    
    if (!startParagraph || !endParagraph) {
      const selectedFragment = range.extractContents();
      const plainText = extractTextContent(selectedFragment);
      const textNode = document.createTextNode(plainText);
      range.insertNode(textNode);
      return;
    }
    
    const workingRange = range.cloneRange();
    
    if (startParagraph === endParagraph) {
      handleSelectionWithinParagraph(workingRange);
    } else {
      handleCrossParagraphSelection(workingRange, startParagraph, endParagraph);
    }
  };
  
  const handleSelectionWithinParagraph = (range: Range) => {
    const fragment = range.extractContents();
    
    const plainText = extractTextContent(fragment);
    
    range.insertNode(document.createTextNode(plainText));
  };
  
  const handleCrossParagraphSelection = (
    range: Range, 
    startParagraph: HTMLElement, 
    endParagraph: HTMLElement
  ) => {
    const originalStartContainer = range.startContainer;
    const originalStartOffset = range.startOffset;
    const originalEndContainer = range.endContainer;
    const originalEndOffset = range.endOffset;
    
    const firstPartRange = document.createRange();
    firstPartRange.setStart(originalStartContainer, originalStartOffset);
    
    const firstFormattedParents: HTMLElement[] = [];
    let currentNode: Node | null = originalStartContainer;
    
    while (currentNode && currentNode !== startParagraph) {
      if (
        currentNode.nodeType === Node.ELEMENT_NODE && 
        ['SPAN', 'B', 'I', 'U', 'STRONG', 'EM'].includes((currentNode as HTMLElement).tagName)
      ) {
        firstFormattedParents.push(currentNode as HTMLElement);
      }
      currentNode = currentNode.parentNode;
    }
    
    firstPartRange.setEndAfter(startParagraph.lastChild || startParagraph);
    
    const firstPartFragment = firstPartRange.extractContents();
    const firstPartText = extractTextContent(firstPartFragment);
    
    if (firstPartText) {
      startParagraph.appendChild(document.createTextNode(firstPartText));
    }
    
    const allParagraphs = getAllParagraphsBetween(startParagraph, endParagraph);
    
    for (let i = 0; i < allParagraphs.length; i++) {
      const paragraph = allParagraphs[i];
      const textContent = paragraph.textContent || '';
      
      while (paragraph.firstChild) {
        paragraph.removeChild(paragraph.firstChild);
      }
      
      paragraph.appendChild(document.createTextNode(textContent));
    }

    const lastPartRange = document.createRange();
    lastPartRange.setStart(endParagraph.firstChild || endParagraph, 0);
    lastPartRange.setEnd(originalEndContainer, originalEndOffset);
    
    const lastPartFragment = lastPartRange.extractContents();
    const lastPartText = extractTextContent(lastPartFragment);
    
    // const lastFormattedParents: HTMLElement[] = [];
    
    let firstFormattedElement = endParagraph.querySelector('span, b, i, u, strong, em');
    
    if (firstFormattedElement) {
      if (lastPartText) {
        endParagraph.insertBefore(
          document.createTextNode(lastPartText), 
          firstFormattedElement
        );
      }
    } else {
      if (lastPartText) {
        endParagraph.appendChild(document.createTextNode(lastPartText));
      }
    }
  };
  
  const findParentByTagName = (node: Node, tagName: string): HTMLElement | null => {
    let current: Node | null = node;
    
    while (current && current !== editorRef.current) {
      if (
        current.nodeType === Node.ELEMENT_NODE && 
        (current as HTMLElement).tagName === tagName
      ) {
        return current as HTMLElement;
      }
      current = current.parentNode;
    }
    
    return null;
  };
  
  const getAllParagraphsBetween = (startParagraph: HTMLElement, endParagraph: HTMLElement): HTMLElement[] => {
    const result: HTMLElement[] = [];
    
    if (!editorRef.current) return result;
    
    const allParagraphs = Array.from(editorRef.current.querySelectorAll('p')) as HTMLElement[];
    
    const startIndex = allParagraphs.findIndex(p => p === startParagraph);
    const endIndex = allParagraphs.findIndex(p => p === endParagraph);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex + 1) {
      return allParagraphs.slice(startIndex + 1, endIndex);
    }
    
    return result;
  };
  
  const splitNestedFormattedParents = (
    formattedParents: HTMLElement[], 
    textNode: Text, 
    startOffset: number, 
    endOffset: number
  ) => {
    const fullText = textNode.textContent || '';
    
    const textBefore = fullText.substring(0, startOffset);
    const selectedText = fullText.substring(startOffset, endOffset);
    const textAfter = fullText.substring(endOffset);
    
    // const innermostParent = formattedParents[0];
    const outerParent = formattedParents[formattedParents.length - 1];
    
    const fragment = document.createDocumentFragment();
    
    if (textBefore) {
      let beforeNode: Node = document.createTextNode(textBefore);
      
      for (let i = formattedParents.length - 1; i >= 0; i--) {
        const clone = formattedParents[i].cloneNode(false) as HTMLElement;
        clone.appendChild(beforeNode);
        beforeNode = clone;
      }
      
      fragment.appendChild(beforeNode);
    }
    
    if (selectedText) {
      fragment.appendChild(document.createTextNode(selectedText));
    }
    
    if (textAfter) {
      let afterNode: Node = document.createTextNode(textAfter);
      
      for (let i = formattedParents.length - 1; i >= 0; i--) {
        const clone = formattedParents[i].cloneNode(false) as HTMLElement;
        clone.appendChild(afterNode);
        afterNode = clone;
      }
      
      fragment.appendChild(afterNode);
    }
    
    if (outerParent.parentNode) {
      outerParent.parentNode.replaceChild(fragment, outerParent);
    }
  };
  
  const extractTextContent = (fragment: DocumentFragment): string => {
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(fragment.cloneNode(true));
    
    const content = tempDiv.innerText || tempDiv.textContent || '';
    
    return content;
  };
  
  const cleanupEmptyElements = (container: HTMLElement) => {
    const emptyElements = container.querySelectorAll('span:empty, b:empty, i:empty, u:empty, strong:empty, em:empty');
    emptyElements.forEach(elem => elem.remove());
    
    const spans = container.querySelectorAll('span, b, i, u, strong, em');
    spans.forEach(elem => {
      const el = elem as HTMLElement;
      if (el.tagName === 'SPAN' && 
          !el.style.length && 
          !el.className && 
          !el.id && 
          el.attributes.length <= 1) {
        while (el.firstChild) {
          el.parentNode?.insertBefore(el.firstChild, el);
        }
        el.remove();
      }
    });
  };
  
  return (
    <button 
      className="toolbar-button format-button" 
      onClick={handleClearFormatting}
      title="Clear Formatting"
    >
      <FormatTextIcon width={25} height={25} className='Format' />
    </button>
  );
};

export default Format;