import React, { useState, useEffect } from 'react';
import './Bold.scss';
import { BoldIcon } from '../Icons/Icons';

interface BoldProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
}

const Bold: React.FC<BoldProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {

  const [isBoldActive, setIsBoldActive] = useState<boolean>(false);

  const checkIsBoldActive = (): boolean => {
    if (!lastSelection) return false;
    
    if (lastSelection.collapsed) {
      let node = lastSelection.startContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }
      
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.fontWeight === 'bold') {
          return true;
        }
        node = node.parentNode as Node;
      }
      
      return false;
    }
    
    return isBoldActive;
  };

  const insertBoldMarker = () => {
    if (!lastSelection || !lastSelection.collapsed || !editorRef.current) return;
    
    const range = lastSelection.cloneRange();
    
    const boldSpan = document.createElement('span');
    boldSpan.style.fontWeight = 'bold';
    
    boldSpan.appendChild(document.createTextNode('\u200B'));
    
    range.insertNode(boldSpan);
    
    range.selectNodeContents(boldSpan);
    range.collapse(false);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    saveSelection();
    onContentChange();
  };

  const exitBoldContext = () => {
    if (!lastSelection || !lastSelection.collapsed || !editorRef.current) return;
    
    const textNode = document.createTextNode('\u200B'); 
    const range = lastSelection.cloneRange();
    
    let node = range.startContainer;
    let paragraph = null;
    
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode as Node;
    }
    
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && 
          (node as HTMLElement).tagName === 'P') {
        paragraph = node;
        break;
      }
      node = node.parentNode as Node;
    }
    
    if (!paragraph) return;
    
    let boldSpan: Node | null = range.startContainer;
    
    if (boldSpan.nodeType === Node.TEXT_NODE) {
      boldSpan = boldSpan.parentNode;
    }
    
    while (boldSpan && boldSpan !== paragraph) {
      if (boldSpan.nodeType === Node.ELEMENT_NODE && 
          (boldSpan as HTMLElement).tagName === 'SPAN' && 
          (boldSpan as HTMLElement).style.fontWeight === 'bold') {
        break;
      }
      boldSpan = boldSpan.parentNode;
    }
    
    if (!boldSpan || boldSpan === paragraph) return;
    
    if (boldSpan.nextSibling) {
      paragraph.insertBefore(textNode, boldSpan.nextSibling);
    } else {
      paragraph.appendChild(textNode);
    }
    
    range.selectNode(textNode);
    range.collapse(false);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    saveSelection();
    onContentChange();
  };

  const toggleBoldState = () => {
    if (!editorRef.current || !lastSelection) return;
    
    if (lastSelection.collapsed) {
      const newState = !checkIsBoldActive();
      setIsBoldActive(newState);
      
      if (newState) {
        insertBoldMarker();
      } else {
        exitBoldContext();
      }
    } else {
      handleExistingBoldLogic();
    }
  };

  const handleExistingBoldLogic = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    const isMultiParagraph = isSelectionAcrossMultipleParagraphs(range);
    
    if (isMultiParagraph) {
      const allBold = areAllParagraphsBold(range);
      if (allBold) {
        removeMultiParagraphBold(range);
      } else {
        applyBold(range);
      }
    } else {
      const startParent = range.startContainer.parentNode;
      const endParent = range.endContainer.parentNode;
      
      const isWithinBoldSpan = 
        (startParent && startParent.nodeType === Node.ELEMENT_NODE && 
         (startParent as HTMLElement).tagName === 'SPAN' && 
         (startParent as HTMLElement).style.fontWeight === 'bold') || 
        (endParent && endParent.nodeType === Node.ELEMENT_NODE && 
         (endParent as HTMLElement).tagName === 'SPAN' && 
         (endParent as HTMLElement).style.fontWeight === 'bold');
      
      if (isWithinBoldSpan) {
        removeBoldFromSelection(range);
      } else {
        const isEntireSelectionBold = isSelectionCompletelyBold(range);
        if (isEntireSelectionBold) {
          removeBold(range);
        } else {
          applyBold(range);
        }
      }
    }
    
    setIsBoldActive(checkIsBoldActive());
  };



  const handleBoldClick = () => {
    if (!editorRef.current) return;
    
    restoreSelection();
    
    toggleBoldState();
    
    saveSelection();
    onContentChange();
  };
  
  const isSelectionAcrossMultipleParagraphs = (range: Range): boolean => {
    const commonAncestor = range.commonAncestorContainer;
    
    let startParagraph: Node | null = null;
    let endParagraph: Node | null = null;
    
    let startNode: Node | null = range.startContainer;
    while (startNode && startNode !== commonAncestor) {
      if (startNode.nodeType === Node.ELEMENT_NODE && 
          (startNode as HTMLElement).tagName === 'P') {
        startParagraph = startNode;
        break;
      }
      startNode = startNode.parentNode as Node | null;
    }
    
    let endNode: Node | null = range.endContainer;
    while (endNode && endNode !== commonAncestor) {
      if (endNode.nodeType === Node.ELEMENT_NODE && 
          (endNode as HTMLElement).tagName === 'P') {
        endParagraph = endNode;
        break;
      }
      endNode = endNode.parentNode as Node | null;
    }
    
    return !!(startParagraph && endParagraph && startParagraph !== endParagraph);
  };
  
  const areAllParagraphsBold = (range: Range): boolean => {
    
    const commonAncestor = range.commonAncestorContainer;
    
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(range.cloneContents());
    
    const paragraphs = tempSpan.querySelectorAll('p');
    
    if (paragraphs.length === 0) {
      let currentNode = range.startContainer;
      while (currentNode && currentNode !== commonAncestor) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && 
            (currentNode as HTMLElement).tagName === 'P') {
          break;
        }
        currentNode = currentNode.parentNode as Node;
      }
      
      return isSelectionCompletelyBold(range);
    }
    
    for (const paragraph of paragraphs) {
      const paragraphText = paragraph.textContent || '';
      if (paragraphText.trim() === '') continue;
      
      let totalBoldText = '';
      const boldSpans = paragraph.querySelectorAll('span[style*="font-weight: bold"]');
      
      for (const span of boldSpans) {
        totalBoldText += span.textContent || '';
      }
      
      if (totalBoldText.trim() !== paragraphText.trim()) {
        return false;
      }
    }
    
    return true;
  };
  
  const removeMultiParagraphBold = (range: Range) => {
    if (!editorRef.current) return;
    
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    const endContainer = range.endContainer;
    const endOffset = range.endOffset;

    const commonAncestor = range.commonAncestorContainer;
    
    let startParagraph: HTMLElement | null = null;
    let endParagraph: HTMLElement | null = null;
    
    let startNode: Node | null = startContainer;
    while (startNode && startNode !== commonAncestor) {
      if (startNode.nodeType === Node.ELEMENT_NODE && 
          (startNode as HTMLElement).tagName === 'P') {
        startParagraph = startNode as HTMLElement;
        break;
      }
      startNode = startNode.parentNode as Node | null;
    }
    
    let endNode: Node | null = endContainer;
    while (endNode && endNode !== commonAncestor) {
      if (endNode.nodeType === Node.ELEMENT_NODE && 
          (endNode as HTMLElement).tagName === 'P') {
        endParagraph = endNode as HTMLElement;
        break;
      }
      endNode = endNode.parentNode as Node | null;
    }
    
    if (!startParagraph || !endParagraph) return;
    
    const paragraphs: HTMLElement[] = [];
    
    if (startParagraph === endParagraph) {
      paragraphs.push(startParagraph);
    } else {
     
      paragraphs.push(startParagraph);
      
      let currentNode = startParagraph.nextSibling;
      while (currentNode && currentNode !== endParagraph) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && 
            (currentNode as HTMLElement).tagName === 'P') {
          paragraphs.push(currentNode as HTMLElement);
        }
        currentNode = currentNode.nextSibling;
      }
      paragraphs.push(endParagraph);
    }
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      
      if (paragraph === startParagraph && paragraph === endParagraph) {
        const paragraphRange = document.createRange();
        paragraphRange.setStart(startContainer, startOffset);
        paragraphRange.setEnd(endContainer, endOffset);
        removeBoldFromSpecificRange(paragraphRange);
      } 
      else if (paragraph === startParagraph) {
        const paragraphRange = document.createRange();
        paragraphRange.setStart(startContainer, startOffset);
        
        if (paragraph.lastChild) {
          if (paragraph.lastChild.nodeType === Node.TEXT_NODE) {
            paragraphRange.setEnd(paragraph.lastChild, paragraph.lastChild.textContent?.length || 0);
          } else {
            paragraphRange.setEndAfter(paragraph.lastChild);
          }
        } else {
          paragraphRange.setEndAfter(paragraph);
        }
        
        removeBoldFromSpecificRange(paragraphRange);
      } 
      else if (paragraph === endParagraph) {
        const paragraphRange = document.createRange();
        
        if (paragraph.firstChild) {
          paragraphRange.setStartBefore(paragraph.firstChild);
        } else {
          paragraphRange.setStartBefore(paragraph);
        }
        
        paragraphRange.setEnd(endContainer, endOffset);
        removeBoldFromSpecificRange(paragraphRange);
      } 
      else {
        const paragraphRange = document.createRange();
        paragraphRange.selectNodeContents(paragraph);
        removeBoldFromSpecificRange(paragraphRange);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };
  
  const removeBoldFromSpecificRange = (range: Range) => {
    const clonedRange = range.cloneRange();
    
    const selectedText = clonedRange.toString();
    
    const fragment = document.createDocumentFragment();
    
    const extractedContent = clonedRange.extractContents();
    
    const processNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        fragment.appendChild(node.cloneNode(true));
      } 
      else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as HTMLElement;
        
        if (elem.tagName === 'SPAN' && elem.style.fontWeight === 'bold') {
          const hasItalic = elem.style.fontStyle === 'italic';
          const hasUnderline = elem.style.textDecorationLine === 'underline';
          
          if (hasItalic || hasUnderline) {
            const newSpan = document.createElement('span');
            if (hasItalic) {
              newSpan.style.fontStyle = 'italic';
            }
            if (hasUnderline) {
              newSpan.style.textDecorationLine = 'underline';
            }
            
            Array.from(elem.childNodes).forEach(child => {
              newSpan.appendChild(child.cloneNode(true));
            });
            
            fragment.appendChild(newSpan);
          } else {
    
            Array.from(elem.childNodes).forEach(child => {
              processNode(child);
            });
          }
        } 
        else {
          const clone = elem.cloneNode(false);
          Array.from(elem.childNodes).forEach(child => {
            processNode(child);
          });
          fragment.appendChild(clone);
        }
      }
    };
    
    Array.from(extractedContent.childNodes).forEach(node => {
      processNode(node);
    });
    
    clonedRange.insertNode(fragment);
  };
  

  const removeBoldFromSelection = (range: Range) => {
    if (!editorRef.current) return;
    
    const originalText = range.toString();
    
    let boldSpan: HTMLElement | null = null;
    let currentNode = range.commonAncestorContainer;
    
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && 
          (currentNode as HTMLElement).tagName === 'SPAN' && 
          (currentNode as HTMLElement).style.fontWeight === 'bold') {
        boldSpan = currentNode as HTMLElement;
        break;
      }
      currentNode = currentNode.parentNode as Node;
    }
    
    if (!boldSpan) return;
    
    const hasItalic = boldSpan.style.fontStyle === 'italic';
    const hasUnderline = boldSpan.style.textDecorationLine === 'underline';
    
    const fullText = boldSpan.textContent || '';
    
    const spanRange = document.createRange();
    spanRange.selectNodeContents(boldSpan);
    
    let startOffsetInSpan = 0;
    let endOffsetInSpan = fullText.length;
    
    if (range.startContainer.nodeType === Node.TEXT_NODE && 
        range.startContainer.parentNode === boldSpan) {

      let node = boldSpan.firstChild;
      while (node && node !== range.startContainer) {
        if (node.nodeType === Node.TEXT_NODE) {
          startOffsetInSpan += node.textContent?.length || 0;
        }
        node = node.nextSibling;
      }
      startOffsetInSpan += range.startOffset;
    } else {
      let textBefore = '';
      const walker = document.createTreeWalker(
        boldSpan, 
        NodeFilter.SHOW_TEXT, 
        null
      );
      
      let node = walker.nextNode();
      let found = false;
      
      while (node && !found) {
        if (node === range.startContainer) {
          textBefore += (node.textContent || '').substring(0, range.startOffset);
          found = true;
        } else {
          textBefore += node.textContent || '';
        }
        
        if (!found) {
          node = walker.nextNode();
        }
      }
      
      startOffsetInSpan = textBefore.length;
    }
    
    if (range.endContainer.nodeType === Node.TEXT_NODE) {
      let textBeforeEnd = '';
      const walker = document.createTreeWalker(
        boldSpan, 
        NodeFilter.SHOW_TEXT, 
        null
      );
      
      let node = walker.nextNode();
      let found = false;
      
      while (node && !found) {
        if (node === range.endContainer) {
          textBeforeEnd += (node.textContent || '').substring(0, range.endOffset);
          found = true;
        } else {
          textBeforeEnd += node.textContent || '';
        }
        
        if (!found) {
          node = walker.nextNode();
        }
      }
      
      endOffsetInSpan = textBeforeEnd.length;
    }
    
    const textBefore = fullText.substring(0, startOffsetInSpan);
    const selectedText = fullText.substring(startOffsetInSpan, endOffsetInSpan);
    const textAfter = fullText.substring(endOffsetInSpan);
    
    const replacementNodes = [];
    
    if (textBefore) {
      const beforeSpan = document.createElement('span');
      beforeSpan.style.fontWeight = 'bold';
      if (hasItalic) {
        beforeSpan.style.fontStyle = 'italic';
      }
      if (hasUnderline) {
        beforeSpan.style.textDecorationLine = 'underline';
      }
      beforeSpan.textContent = textBefore;
      replacementNodes.push(beforeSpan);
    }
    
    if (selectedText) {
      if (hasItalic || hasUnderline) {
        const styledSpan = document.createElement('span');
        
        if (hasItalic) {
          styledSpan.style.fontStyle = 'italic';
        }
        
        if (hasUnderline) {
          styledSpan.style.textDecorationLine = 'underline';
        }
        
        styledSpan.textContent = selectedText;
        replacementNodes.push(styledSpan);
      } else {
        replacementNodes.push(document.createTextNode(selectedText));
      }
    }
    
    if (textAfter) {
      const afterSpan = document.createElement('span');
      afterSpan.style.fontWeight = 'bold';
      if (hasItalic) {
        afterSpan.style.fontStyle = 'italic';
      }
      if (hasUnderline) {
        afterSpan.style.textDecorationLine = 'underline';
      }
      afterSpan.textContent = textAfter;
      replacementNodes.push(afterSpan);
    }
    
    const parent = boldSpan.parentNode;
    if (parent) {
      replacementNodes.forEach((node, index) => {
        if (index === 0) {
          parent.replaceChild(node, boldSpan);
        } else {
          if (replacementNodes[index - 1].nextSibling) {
            parent.insertBefore(node, replacementNodes[index - 1].nextSibling);
          } else {
            parent.appendChild(node);
          }
        }
      });
    }
    
    cleanupEmptySpans(editorRef.current);
  };
  
  const isSelectionCompletelyBold = (range: Range): boolean => {
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(range.cloneContents());
    
    if (!tempSpan.textContent || tempSpan.textContent.trim() === '') {
      return false;
    }
        let hasNonBoldText = false;
    
    const checkNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim() !== '' && 
            (!node.parentElement || node.parentElement.tagName !== 'SPAN' || 
             node.parentElement.style.fontWeight !== 'bold')) {
          hasNonBoldText = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {

        if ((node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.fontWeight === 'bold') {

          Array.from(node.childNodes).forEach(checkNode);
        } 
        else if ((node as HTMLElement).tagName !== 'SPAN' || 
                 (node as HTMLElement).style.fontWeight !== 'bold') {
     
          if (node.textContent && node.textContent.trim() !== '') {
            const directTextContent = Array.from(node.childNodes)
              .filter(child => child.nodeType === Node.TEXT_NODE)
              .map(child => child.textContent)
              .join('');
            
            if (directTextContent.trim() !== '') {
              hasNonBoldText = true;
            } else {
              Array.from(node.childNodes).forEach(checkNode);
            }
          }
        }
      }
    };
    

    Array.from(tempSpan.childNodes).forEach(checkNode);
    
    return !hasNonBoldText;
  };
  
  const applyBold = (range: Range) => {
    if (!editorRef.current) return;
    
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startContainerParent = startContainer.parentNode;
    const endContainerParent = endContainer.parentNode;
    
    const isMultiParagraph = 
      (startContainerParent !== endContainerParent) ||
      (startContainer.nodeType === Node.ELEMENT_NODE && 
       (startContainer as HTMLElement).tagName === 'DIV' && 
       (startContainer as HTMLElement).querySelector('p'));
    
    if (isMultiParagraph) {
      applyBoldToMultiParagraph(range);
    } else {
      const fragment = range.extractContents();
      
      const italicSpans = Array.from(fragment.querySelectorAll('span[style*="font-style: italic"]'));
      const hasItalicSpans = italicSpans.length > 0;
      
      if (hasItalicSpans) {
        italicSpans.forEach(italicSpan => {
          italicSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });
        
        processNonItalicText(fragment);
        
        range.insertNode(fragment);
      } else {
        const boldSpan = document.createElement('span');
        boldSpan.style.fontWeight = 'bold';
        
        while (fragment.firstChild) {
          boldSpan.appendChild(fragment.firstChild);
        }
        
        range.insertNode(boldSpan);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };
  
  const processNonItalicText = (fragment: DocumentFragment) => {
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.parentElement) return NodeFilter.FILTER_ACCEPT;
          
          if (node.parentElement.tagName === 'SPAN') {
            if (node.parentElement.style.fontStyle === 'italic') {
              return NodeFilter.FILTER_REJECT;
            }
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    
    const textNodes: Text[] = [];
    let currentNode: Node | null;
    
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode as Text);
    }
    
    textNodes.forEach(textNode => {
      if (!textNode.textContent || textNode.textContent.trim() === '') return;
      
      const boldSpan = document.createElement('span');
      boldSpan.style.fontWeight = 'bold';
            const parent = textNode.parentNode;
      
      if (parent) {
        boldSpan.textContent = textNode.textContent;
        parent.replaceChild(boldSpan, textNode);
      }
    });
  };
  
  const applyBoldToMultiParagraph = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    
    let startParagraph: HTMLElement | null = null;
    let endParagraph: HTMLElement | null = null;
    
    let startNode: Node | null = range.startContainer;
    while (startNode && startNode !== commonAncestor) {
      if (startNode.nodeType === Node.ELEMENT_NODE && 
          (startNode as HTMLElement).tagName === 'P') {
        startParagraph = startNode as HTMLElement;
        break;
      }
      startNode = startNode.parentNode as Node | null;
    }
    
    let endNode: Node | null = range.endContainer;
    while (endNode && endNode !== commonAncestor) {
      if (endNode.nodeType === Node.ELEMENT_NODE && 
          (endNode as HTMLElement).tagName === 'P') {
        endParagraph = endNode as HTMLElement;
        break;
      }
      endNode = endNode.parentNode as Node | null;
    }
    
    if (!startParagraph || !endParagraph) {
      const fragment = range.extractContents();
      
      const italicSpans = Array.from(fragment.querySelectorAll('span[style*="font-style: italic"]'));
      const hasItalicSpans = italicSpans.length > 0;
      
      if (hasItalicSpans) {
        italicSpans.forEach(italicSpan => {
          italicSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });        
        processNonItalicText(fragment);
        
        range.insertNode(fragment);
      } else {
        const boldSpan = document.createElement('span');
        boldSpan.style.fontWeight = 'bold';
        
        while (fragment.firstChild) {
          boldSpan.appendChild(fragment.firstChild);
        }
        
        range.insertNode(boldSpan);
      }
      return;
    }
    
    const allParagraphs: HTMLElement[] = [];
    
    if (startParagraph === endParagraph) {
      allParagraphs.push(startParagraph);
    } else {
      allParagraphs.push(startParagraph);
      
      let currentNode = startParagraph.nextSibling;
      while (currentNode && currentNode !== endParagraph) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && 
            (currentNode as HTMLElement).tagName === 'P') {
          allParagraphs.push(currentNode as HTMLElement);
        }
        currentNode = currentNode.nextSibling;
      }
      
      allParagraphs.push(endParagraph);
    }
    
    for (const paragraph of allParagraphs) {
      const paragraphRange = document.createRange();
      
      if (paragraph === startParagraph) {
        paragraphRange.setStart(range.startContainer, range.startOffset);
        paragraphRange.setEndAfter(paragraph.lastChild || paragraph);
      } else if (paragraph === endParagraph) {
        paragraphRange.setStartBefore(paragraph.firstChild || paragraph);
        paragraphRange.setEnd(range.endContainer, range.endOffset);
      } else {
        paragraphRange.selectNodeContents(paragraph);
      }
      
      const paragraphFragment = paragraphRange.extractContents();
      
      const italicSpans = Array.from(paragraphFragment.querySelectorAll('span[style*="font-style: italic"]'));
      const hasItalicSpans = italicSpans.length > 0;
      
      if (hasItalicSpans) {
        italicSpans.forEach(italicSpan => {
          italicSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });
        
        processNonItalicText(paragraphFragment);
        
        paragraphRange.insertNode(paragraphFragment);
      } else {
        const boldSpan = document.createElement('span');
        boldSpan.style.fontWeight = 'bold';
        
        while (paragraphFragment.firstChild) {
          boldSpan.appendChild(paragraphFragment.firstChild);
        }       
        paragraphRange.insertNode(boldSpan);
      }
    }
  };
  
  const removeBold = (range: Range) => {
    if (!editorRef.current) return;
    
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    const isMultiParagraph = 
      startContainer.parentNode !== endContainer.parentNode ||
      (startContainer.nodeType === Node.ELEMENT_NODE && 
       (startContainer as HTMLElement).tagName === 'DIV');
    
    if (isMultiParagraph) {
      removeBoldFromMultiParagraph(range);
    } else {
      const fragment = range.extractContents();
      
      const processedFragment = document.createDocumentFragment();
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processedFragment.appendChild(node.cloneNode(true));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          
          if (elem.tagName === 'SPAN' && elem.style.fontWeight === 'bold') {
            Array.from(elem.childNodes).forEach(processNode);
          } else {
            const clone = elem.cloneNode(false);
            Array.from(elem.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                clone.appendChild(child.cloneNode(true));
              } else {
                processNode(child);
              }
            });
            processedFragment.appendChild(clone);
          }
        }
      };
      
      Array.from(fragment.childNodes).forEach(processNode);
      
      range.insertNode(processedFragment);
    }
    
    cleanupEmptySpans(editorRef.current);
  };
  
  const removeBoldFromMultiParagraph = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    
    let startParagraph: HTMLElement | null = null;
    let endParagraph: HTMLElement | null = null;
    
    let startNode: Node | null = range.startContainer;
    while (startNode && startNode !== commonAncestor) {
      if (startNode.nodeType === Node.ELEMENT_NODE && 
          (startNode as HTMLElement).tagName === 'P') {
        startParagraph = startNode as HTMLElement;
        break;
      }
      startNode = startNode.parentNode as Node | null;
    }
    
    let endNode: Node | null = range.endContainer;
    while (endNode && endNode !== commonAncestor) {
      if (endNode.nodeType === Node.ELEMENT_NODE && 
          (endNode as HTMLElement).tagName === 'P') {
        endParagraph = endNode as HTMLElement;
        break;
      }
      endNode = endNode.parentNode as Node | null;
    }
    
    if (!startParagraph || !endParagraph) {
      const fragment = range.extractContents();
      const processed = document.createDocumentFragment();
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processed.appendChild(node.cloneNode(true));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          
          if (elem.tagName === 'SPAN' && elem.style.fontWeight === 'bold') {
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderline = elem.style.textDecorationLine === 'underline';
            
            if (hasItalic || hasUnderline) {
              const newSpan = document.createElement('span');
              if (hasItalic) {
                newSpan.style.fontStyle = 'italic';
              }
              if (hasUnderline) {
                newSpan.style.textDecorationLine = 'underline';
              }
              
              Array.from(elem.childNodes).forEach(child => {
                newSpan.appendChild(child.cloneNode(true));
              });
              
              processed.appendChild(newSpan);
            } else {
              Array.from(elem.childNodes).forEach(child => {
                processed.appendChild(child.cloneNode(true));
              });
            }
          } else {
            const clone = elem.cloneNode(false);
            Array.from(elem.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                clone.appendChild(child.cloneNode(true));
              } else {
                processNode(child);
              }
            });
            processed.appendChild(clone);
          }
        }
      };
      
      Array.from(fragment.childNodes).forEach(processNode);
      
      range.insertNode(processed);
      return;
    }
    
    const allParagraphs: HTMLElement[] = [];
    
    if (startParagraph === endParagraph) {
      allParagraphs.push(startParagraph);
    } else {
      allParagraphs.push(startParagraph);
      
      let currentNode = startParagraph.nextSibling;
      while (currentNode && currentNode !== endParagraph) {
        if (currentNode.nodeType === Node.ELEMENT_NODE && 
            (currentNode as HTMLElement).tagName === 'P') {
          allParagraphs.push(currentNode as HTMLElement);
        }
        currentNode = currentNode.nextSibling;
      }
      
      allParagraphs.push(endParagraph);
    }
    
    for (const paragraph of allParagraphs) {
      const paragraphRange = document.createRange();
      
      if (paragraph === startParagraph) {
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          paragraphRange.setStart(range.startContainer, range.startOffset);
        } else {
          const firstTextNode = findFirstTextNode(range.startContainer);
          if (firstTextNode) {
            paragraphRange.setStart(firstTextNode, range.startOffset);
          } else {
            paragraphRange.setStart(range.startContainer, range.startOffset);
          }
        }
        paragraphRange.setEndAfter(paragraph.lastChild || paragraph);
      } else if (paragraph === endParagraph) {
        paragraphRange.setStartBefore(paragraph.firstChild || paragraph);
        
        if (range.endContainer.nodeType === Node.TEXT_NODE) {
          paragraphRange.setEnd(range.endContainer, range.endOffset);
        } else {
          const lastTextNode = findLastTextNode(range.endContainer);
          if (lastTextNode) {
            paragraphRange.setEnd(lastTextNode, range.endOffset);
          } else {
            paragraphRange.setEnd(range.endContainer, range.endOffset);
          }
        }
      } else {
        paragraphRange.selectNodeContents(paragraph);
      }
      
      const paragraphFragment = paragraphRange.extractContents();
      
      const processedFragment = document.createDocumentFragment();
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processedFragment.appendChild(node.cloneNode(true));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          
          if (elem.tagName === 'SPAN' && elem.style.fontWeight === 'bold') {
         
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderline = elem.style.textDecorationLine === 'underline';
            
            if (hasItalic || hasUnderline) {
              const newSpan = document.createElement('span');
              if (hasItalic) {
                newSpan.style.fontStyle = 'italic';
              }
              if (hasUnderline) {
                newSpan.style.textDecorationLine = 'underline';
              }
              
              Array.from(elem.childNodes).forEach(child => {
                newSpan.appendChild(child.cloneNode(true));
              });
              
              processedFragment.appendChild(newSpan);
            } else {
              Array.from(elem.childNodes).forEach(child => {
                processedFragment.appendChild(child.cloneNode(true));
              });
            }
          } else {
            const clone = elem.cloneNode(false);
            Array.from(elem.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                clone.appendChild(child.cloneNode(true));
              } else {
                const childFragment = document.createDocumentFragment();
                processNode(child);
                while (childFragment.firstChild) {
                  clone.appendChild(childFragment.firstChild);
                }
              }
            });
            processedFragment.appendChild(clone);
          }
        }
      };
      
      Array.from(paragraphFragment.childNodes).forEach(processNode);
      
      paragraphRange.insertNode(processedFragment);
    }
    

    cleanupEmptySpans(editorRef.current);
  };
  
  const findFirstTextNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }
    
    for (let i = 0; i < node.childNodes.length; i++) {
      const found = findFirstTextNode(node.childNodes[i]);
      if (found) {
        return found;
      }
    }
    
    return null;
  };
  
  const findLastTextNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node;
    }
    
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const found = findLastTextNode(node.childNodes[i]);
      if (found) {
        return found;
      }
    }
    
    return null;
  };
  

  const cleanupEmptySpans = (container: HTMLElement) => {
    const emptySpans = container.querySelectorAll('span:empty');
    emptySpans.forEach(span => span.remove());
    
    mergeAdjacentBoldSpans(container);
  };
  
  const mergeAdjacentBoldSpans = (container: HTMLElement) => {
    const boldSpans = container.querySelectorAll('span[style*="font-weight: bold"]');
    
    for (let i = 0; i < boldSpans.length; i++) {
      const currentSpan = boldSpans[i] as HTMLElement;
      
      if (!container.contains(currentSpan)) continue;
      
      let nextSibling = currentSpan.nextSibling;
      
      while (nextSibling) {
        if (
          nextSibling.nodeType === Node.ELEMENT_NODE && 
          (nextSibling as HTMLElement).tagName === 'SPAN' && 
          (nextSibling as HTMLElement).style.fontWeight === 'bold'
        ) {
          while (nextSibling.firstChild) {
            currentSpan.appendChild(nextSibling.firstChild);
          }
          
          const siblingToRemove = nextSibling;
          nextSibling = nextSibling.nextSibling;
          siblingToRemove.remove();
        } else {
          break;
        }
      }
    }
  };

  useEffect(() => {
    setIsBoldActive(checkIsBoldActive());
  }, [lastSelection]);
  
  return (
    <button 
      className={`toolbar-button bold-button ${isBoldActive ? 'active' : ''}`}
      onClick={handleBoldClick}
      title="Bold"
    >
      <BoldIcon width={25} height={26} />
    </button>
  );
};

export default Bold;