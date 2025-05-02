import React, { useState, useEffect } from 'react';
import './UnderLine.scss';
import { UnderlineIcon } from '../Icons/Icons';

interface UnderLineProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
}

const UnderLine: React.FC<UnderLineProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);

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
    
    mergeAdjacentUnderLineSpans(container);
  };
  
  const mergeAdjacentUnderLineSpans = (container: HTMLElement) => {
    const underLineSpans = container.querySelectorAll('span[style*="text-decoration-line: underline"]');
    
    for (let i = 0; i < underLineSpans.length; i++) {
      const currentSpan = underLineSpans[i] as HTMLElement;
      
      if (!container.contains(currentSpan)) continue;
      
      let nextSibling = currentSpan.nextSibling;
      
      while (nextSibling) {
        if (
          nextSibling.nodeType === Node.ELEMENT_NODE && 
          (nextSibling as HTMLElement).tagName === 'SPAN' && 
          (nextSibling as HTMLElement).style.textDecorationLine === 'underline'
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

  const removeUnderLineFromSpecificRange = (range: Range) => {
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
        
        if (elem.tagName === 'SPAN' && elem.style.textDecorationLine === 'underline') {
        
          const hasBold = elem.style.fontWeight === 'bold';
          const hasItalic = elem.style.fontStyle === 'italic';
          
          if (hasBold || hasItalic) {
            const newSpan = document.createElement('span');
            if (hasBold) {
              newSpan.style.fontWeight = 'bold';
            }
            if (hasItalic) {
              newSpan.style.fontStyle = 'italic';
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
  const removeMultiParagraphUnderLine = (range: Range) => {
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
        removeUnderLineFromSpecificRange(paragraphRange);
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
        
        removeUnderLineFromSpecificRange(paragraphRange);
      } 
      else if (paragraph === endParagraph) {
        const paragraphRange = document.createRange();
        
        if (paragraph.firstChild) {
          paragraphRange.setStartBefore(paragraph.firstChild);
        } else {
          paragraphRange.setStartBefore(paragraph);
        }
        
        paragraphRange.setEnd(endContainer, endOffset);
        removeUnderLineFromSpecificRange(paragraphRange);
      } 
      else {
        const paragraphRange = document.createRange();
        paragraphRange.selectNodeContents(paragraph);
        removeUnderLineFromSpecificRange(paragraphRange);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };

  const removeUnderLineFromSelection = (range: Range) => {
    if (!editorRef.current) return;
    
    const originalText = range.toString();
    
    let underLineSpan: HTMLElement | null = null;
    let currentNode = range.commonAncestorContainer;
    
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && 
          (currentNode as HTMLElement).tagName === 'SPAN' && 
          (currentNode as HTMLElement).style.textDecorationLine === 'underline') {
        underLineSpan = currentNode as HTMLElement;
        break;
      }
      currentNode = currentNode.parentNode as Node;
    }
    
    if (!underLineSpan) return;
    
    const hasBold = underLineSpan.style.fontWeight === 'bold';
    const hasItalic = underLineSpan.style.fontStyle === 'italic';
    
    const fullText = underLineSpan.textContent || '';
    
    let startOffsetInSpan = 0;
    let endOffsetInSpan = fullText.length;
    
    if (range.startContainer.nodeType === Node.TEXT_NODE && 
        range.startContainer.parentNode === underLineSpan) {
      let node = underLineSpan.firstChild;
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
        underLineSpan, 
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
        underLineSpan, 
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
    
    const nodes: Array<Node> = [];
    
    if (textBefore) {
      const beforeSpan = document.createElement('span');
      beforeSpan.style.textDecorationLine = 'underline';
      if (hasBold) {
        beforeSpan.style.fontWeight = 'bold';
      }
      if (hasItalic) {
        beforeSpan.style.fontStyle = 'italic';
      }
      beforeSpan.textContent = textBefore;
      nodes.push(beforeSpan);
    }
    
    if (selectedText) {
      if (hasBold && hasItalic) {
        const styledSpan = document.createElement('span');
        styledSpan.style.fontWeight = 'bold';
        styledSpan.style.fontStyle = 'italic';
        styledSpan.textContent = selectedText;
        nodes.push(styledSpan);
      } else if (hasBold) {
        const boldSpan = document.createElement('span');
        boldSpan.style.fontWeight = 'bold';
        boldSpan.textContent = selectedText;
        nodes.push(boldSpan);
      } else if (hasItalic) {
        const italicSpan = document.createElement('span');
        italicSpan.style.fontStyle = 'italic';
        italicSpan.textContent = selectedText;
        nodes.push(italicSpan);
      } else {
        nodes.push(document.createTextNode(selectedText));
      }
    }
    
    if (textAfter) {
      const afterSpan = document.createElement('span');
      afterSpan.style.textDecorationLine = 'underline';
      if (hasBold) {
        afterSpan.style.fontWeight = 'bold';
      }
      if (hasItalic) {
        afterSpan.style.fontStyle = 'italic';
      }
      afterSpan.textContent = textAfter;
      nodes.push(afterSpan);
    }
    
    const parent = underLineSpan.parentNode;
    if (parent) {
      if (nodes.length > 0) {
        parent.replaceChild(nodes[0], underLineSpan);
        
        for (let i = 1; i < nodes.length; i++) {
          if (nodes[i-1].nextSibling) {
            parent.insertBefore(nodes[i], nodes[i-1].nextSibling);
          } else {
            parent.appendChild(nodes[i]);
          }
        }
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };

  const removeUnderLineFromMultiParagraph = (range: Range) => {
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
          
          if (elem.tagName === 'SPAN') {
            const hasBold = elem.style.fontWeight === 'bold';
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderLine = elem.style.textDecorationLine === 'underline';
            
            if (hasUnderLine) {
              if (hasBold || hasItalic) {
                const styledSpan = document.createElement('span');
                if (hasBold) {
                  styledSpan.style.fontWeight = 'bold';
                }
                if (hasItalic) {
                  styledSpan.style.fontStyle = 'italic';
                }
  
                Array.from(elem.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    styledSpan.appendChild(child.cloneNode(true));
                  } else {
                    processNode(child);
                  }
                });
                
                processed.appendChild(styledSpan);
              } else {
                Array.from(elem.childNodes).forEach(processNode);
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
          
          if (elem.tagName === 'SPAN') {
            const hasBold = elem.style.fontWeight === 'bold';
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderLine = elem.style.textDecorationLine === 'underline';
            
            if (hasUnderLine) {
              if (hasBold || hasItalic) {
                const styledSpan = document.createElement('span');
                if (hasBold) {
                  styledSpan.style.fontWeight = 'bold';
                }
                if (hasItalic) {
                  styledSpan.style.fontStyle = 'italic';
                }
                styledSpan.textContent = elem.textContent;
                processedFragment.appendChild(styledSpan);
              } else {
               
                processedFragment.appendChild(document.createTextNode(elem.textContent || ''));
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
              processedFragment.appendChild(clone);
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
            processedFragment.appendChild(clone);
          }
        }
      };
      
      Array.from(paragraphFragment.childNodes).forEach(processNode);     
      paragraphRange.insertNode(processedFragment);
    }
  };


const processNonStyledText = (fragment: DocumentFragment) => {
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.parentElement) return NodeFilter.FILTER_ACCEPT;
          
          if (node.parentElement.tagName === 'SPAN') {
            if (node.parentElement.style.fontWeight === 'bold' || 
                node.parentElement.style.fontStyle === 'italic') {
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
      
      const underLineSpan = document.createElement('span');
      underLineSpan.style.textDecorationLine = 'underline';
      
      const parent = textNode.parentNode;
      
      if (parent) {
        underLineSpan.textContent = textNode.textContent;
        parent.replaceChild(underLineSpan, textNode);
      }
    });
  };

  const applyUnderLineToMultiParagraph = (range: Range) => {
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
  
      const styledSpans = Array.from(fragment.querySelectorAll('span[style*="font-weight: bold"], span[style*="font-style: italic"]'));
      const hasStyledSpans = styledSpans.length > 0;
      
      if (hasStyledSpans) {
        styledSpans.forEach(styledSpan => {
          const hasBold = (styledSpan as HTMLElement).style.fontWeight === 'bold';
          const hasItalic = (styledSpan as HTMLElement).style.fontStyle === 'italic';
          
          let styleStr = 'text-decoration-line: underline;';
          if (hasBold) {
            styleStr += ' font-weight: bold;';
          }
          if (hasItalic) {
            styleStr += ' font-style: italic;';
          }
          
          styledSpan.setAttribute('style', styleStr);
        });
        
        processNonStyledText(fragment);
        
        range.insertNode(fragment);
      } else {
        const underLineSpan = document.createElement('span');
        underLineSpan.style.textDecorationLine = 'underline';
        
        while (fragment.firstChild) {
          underLineSpan.appendChild(fragment.firstChild);
        }
        
        range.insertNode(underLineSpan);
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
        if (range.startContainer.nodeType === Node.TEXT_NODE) {
          paragraphRange.setStart(range.startContainer, range.startOffset);
        } else {
          const firstTextNode = findFirstTextNode(range.startContainer);
          if (firstTextNode) {
            paragraphRange.setStart(firstTextNode, 0);
          } else {
            paragraphRange.setStart(range.startContainer, range.startOffset);
          }
        }
        paragraphRange.setEndAfter(paragraph.lastChild || paragraph);
      } 
      else if (paragraph === endParagraph) {
        paragraphRange.setStartBefore(paragraph.firstChild || paragraph);
        
        if (range.endContainer.nodeType === Node.TEXT_NODE) {
          paragraphRange.setEnd(range.endContainer, range.endOffset);
        } else {
          const lastTextNode = findLastTextNode(range.endContainer);
          if (lastTextNode) {
            paragraphRange.setEnd(lastTextNode, (lastTextNode.textContent || '').length);
          } else {
            paragraphRange.setEnd(range.endContainer, range.endOffset);
          }
        }
      } 
      else {
      
        paragraphRange.selectNodeContents(paragraph);
      }
      
      const paragraphFragment = paragraphRange.extractContents();
      const processedFragment = document.createDocumentFragment();
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent || node.textContent.trim() === '') {
            processedFragment.appendChild(node.cloneNode(true));
            return;
          }
          
          const underLineSpan = document.createElement('span');
          underLineSpan.style.textDecorationLine = 'underline';
          underLineSpan.textContent = node.textContent;
          processedFragment.appendChild(underLineSpan);
        } 
        else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          
          if (elem.tagName === 'SPAN') {
            const hasBold = elem.style.fontWeight === 'bold';
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderLine = elem.style.textDecorationLine === 'underline';
            
            const newSpan = document.createElement('span');
            newSpan.style.textDecorationLine = 'underline';
            
            if (hasBold) {
              newSpan.style.fontWeight = 'bold';
            }
            if (hasItalic) {
              newSpan.style.fontStyle = 'italic';
            }
            
            Array.from(elem.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                newSpan.appendChild(child.cloneNode(true));
              } else {
                processNode(child);
              }
            });
            
            processedFragment.appendChild(newSpan);
          } 
          else {
            const clone = elem.cloneNode(false);
            
            if (elem.childNodes.length === 0 || !elem.textContent || elem.textContent.trim() === '') {
              processedFragment.appendChild(clone);
              return;
            }
            
            Array.from(elem.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                if (!child.textContent || child.textContent.trim() === '') {
                  clone.appendChild(child.cloneNode(true));
                  return;
                }
                
                const underLineSpan = document.createElement('span');
                underLineSpan.style.textDecorationLine = 'underline';
                underLineSpan.textContent = child.textContent;
                clone.appendChild(underLineSpan);
              } else {
                const childClone = document.createDocumentFragment();
                processNode(child);
                while (childClone.firstChild) {
                  clone.appendChild(childClone.firstChild);
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
    
    if (editorRef.current) {
      cleanupEmptySpans(editorRef.current);
    }
  };
  
  const removeUnderLine = (range: Range) => {
    if (!editorRef.current) return;
  
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    const isMultiParagraph = 
      startContainer.parentNode !== endContainer.parentNode ||
      (startContainer.nodeType === Node.ELEMENT_NODE && 
       (startContainer as HTMLElement).tagName === 'DIV');
    
    if (isMultiParagraph) {
      removeUnderLineFromMultiParagraph(range);
    } else {
      const fragment = range.extractContents();
      
      const processedFragment = document.createDocumentFragment();
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          processedFragment.appendChild(node.cloneNode(true));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const elem = node as HTMLElement;
          
          if (elem.tagName === 'SPAN') {
            const hasBold = elem.style.fontWeight === 'bold';
            const hasItalic = elem.style.fontStyle === 'italic';
            const hasUnderLine = elem.style.textDecorationLine === 'underline';
            
            if (hasUnderLine) {
              if (hasBold || hasItalic) {
                const styledSpan = document.createElement('span');
                if (hasBold) {
                  styledSpan.style.fontWeight = 'bold';
                }
                if (hasItalic) {
                  styledSpan.style.fontStyle = 'italic';
                }
                
                Array.from(elem.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    styledSpan.appendChild(child.cloneNode(true));
                  } else {
                    processNode(child);
                  }
                });
                
                processedFragment.appendChild(styledSpan);
              } else {
                Array.from(elem.childNodes).forEach(processNode);
              }
            } else {
              const clone = elem.cloneNode(false);
              Array.from(elem.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                  clone.appendChild(child.cloneNode(true));
                } else {
                  const childResult = document.createDocumentFragment();
                  processNode(child);
                  while (childResult.firstChild) {
                    clone.appendChild(childResult.firstChild);
                  }
                }
              });
              processedFragment.appendChild(clone);
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
            processedFragment.appendChild(clone);
          }
        }
      };
      
      Array.from(fragment.childNodes).forEach(processNode);
      
      range.insertNode(processedFragment);
    }
    
    cleanupEmptySpans(editorRef.current);
  };

  const checkIfUnderLine = () => {
    if (!lastSelection) return false;
    
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(lastSelection.cloneContents());
    
    if (!tempSpan.textContent || tempSpan.textContent.trim() === '') {
      return false;
    }
    
    let hasNonUnderLineText = false;
    const checkNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim() !== '' && 
            (!node.parentElement || node.parentElement.tagName !== 'SPAN' || 
             node.parentElement.style.textDecorationLine !== 'underline')) {
          hasNonUnderLineText = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.textDecorationLine === 'underline') {
          Array.from(node.childNodes).forEach(checkNode);
        } 
        else if ((node as HTMLElement).tagName !== 'SPAN' || 
                 (node as HTMLElement).style.textDecorationLine !== 'underline') {
          if (node.textContent && node.textContent.trim() !== '') {
            const directTextContent = Array.from(node.childNodes)
              .filter(child => child.nodeType === Node.TEXT_NODE)
              .map(child => child.textContent)
              .join('');
            
            if (directTextContent.trim() !== '') {
              hasNonUnderLineText = true;
            } else {
              Array.from(node.childNodes).forEach(checkNode);
            }
          }
        }
      }
    };
    
    Array.from(tempSpan.childNodes).forEach(checkNode);
    
    return !hasNonUnderLineText;
  };

  useEffect(() => {
    if (lastSelection) {
      setIsActive(checkIfUnderLine());
    }
  }, [lastSelection]);

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
  
  const areAllParagraphsUnderLine = (range: Range): boolean => {
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
      
      return isSelectionCompletelyUnderLine(range);
    }
    
    for (const paragraph of paragraphs) {
      const paragraphText = paragraph.textContent || '';
      if (paragraphText.trim() === '') continue;
      
      let totalUnderLineText = '';
      const underLineSpans = paragraph.querySelectorAll('span[style*="text-decoration-line: underline"]');
      
      for (const span of underLineSpans) {
        totalUnderLineText += span.textContent || '';
      }
      
      if (totalUnderLineText.trim() !== paragraphText.trim()) {
        return false;
      }
    }
    
    return true;
  };
  
  const isSelectionCompletelyUnderLine = (range: Range): boolean => {
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(range.cloneContents());
    
    if (!tempSpan.textContent || tempSpan.textContent.trim() === '') {
      return false;
    }
    
    let hasNonUnderLineText = false;
    
    const checkNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim() !== '' && 
            (!node.parentElement || node.parentElement.tagName !== 'SPAN' || 
             node.parentElement.style.textDecorationLine !== 'underline')) {
          hasNonUnderLineText = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.textDecorationLine === 'underline') {
          Array.from(node.childNodes).forEach(checkNode);
        } 
        else if ((node as HTMLElement).tagName !== 'SPAN' || 
                 (node as HTMLElement).style.textDecorationLine !== 'underline') {
          if (node.textContent && node.textContent.trim() !== '') {
            const directTextContent = Array.from(node.childNodes)
              .filter(child => child.nodeType === Node.TEXT_NODE)
              .map(child => child.textContent)
              .join('');
            
            if (directTextContent.trim() !== '') {
              hasNonUnderLineText = true;
            } else {
              Array.from(node.childNodes).forEach(checkNode);
            }
          }
        }
      }
    };
    
    Array.from(tempSpan.childNodes).forEach(checkNode);    
    return !hasNonUnderLineText;
  };

  const handleUnderLineClick = () => {
    if (!editorRef.current) return;
    
    restoreSelection();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    const isMultiParagraph = isSelectionAcrossMultipleParagraphs(range);
    
    if (isMultiParagraph) {
      const allUnderLine = areAllParagraphsUnderLine(range);
      
      if (allUnderLine) {
        removeMultiParagraphUnderLine(range);
      } else {
        applyUnderLine(range);
      }
    } else {
      const startParent = range.startContainer.parentNode;
      const endParent = range.endContainer.parentNode;
      
      const isWithinUnderLineSpan = 
        (startParent && startParent.nodeType === Node.ELEMENT_NODE && 
         (startParent as HTMLElement).tagName === 'SPAN' && 
         (startParent as HTMLElement).style.textDecorationLine === 'underline') || 
        (endParent && endParent.nodeType === Node.ELEMENT_NODE && 
         (endParent as HTMLElement).tagName === 'SPAN' && 
         (endParent as HTMLElement).style.textDecorationLine === 'underline');
      
      if (isWithinUnderLineSpan) {
        removeUnderLineFromSelection(range);
      } else {
        const isEntireSelectionUnderLine = isSelectionCompletelyUnderLine(range);
        
        if (isEntireSelectionUnderLine) {
          removeUnderLine(range);
        } else {
          applyUnderLine(range);
        }
      }
    }
    
    saveSelection();
    onContentChange();
  };

  const applyUnderLine = (range: Range) => {
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
      applyUnderLineToMultiParagraph(range);
    } else {
      const fragment = range.extractContents();
      
      const styledSpans = Array.from(fragment.querySelectorAll('span[style*="font-weight: bold"], span[style*="font-style: italic"]'));
      const hasStyledSpans = styledSpans.length > 0;
      
      if (hasStyledSpans) {
        styledSpans.forEach(styledSpan => {
          const hasBold = (styledSpan as HTMLElement).style.fontWeight === 'bold';
          const hasItalic = (styledSpan as HTMLElement).style.fontStyle === 'italic';
          
          let styleStr = 'text-decoration-line: underline;';
          if (hasBold) {
            styleStr += ' font-weight: bold;';
          }
          if (hasItalic) {
            styleStr += ' font-style: italic;';
          }
          
          styledSpan.setAttribute('style', styleStr);
        });
        
        processNonStyledText(fragment);
        
        range.insertNode(fragment);
      } else {
        const underLineSpan = document.createElement('span');
        underLineSpan.style.textDecorationLine = 'underline';
        
        while (fragment.firstChild) {
          underLineSpan.appendChild(fragment.firstChild);
        }
        
        range.insertNode(underLineSpan);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };
  
  return (
    <button 
      className={`toolbar-button underline-button ${isActive ? 'active' : ''}`}
      onClick={handleUnderLineClick}
      title="Underline"
    >
      <UnderlineIcon width={22} height={24} className='UnderLine' />
    </button>
  );
};

export default UnderLine;
  