import React, { useState, useEffect } from 'react';
import './Italic.scss';
import { ItalicIcon } from '../Icons/Icons';
interface ItalicProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
}

const Italic: React.FC<ItalicProps> = ({
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
    
    mergeAdjacentItalicSpans(container);
  };
  
  const mergeAdjacentItalicSpans = (container: HTMLElement) => {
  
    const italicSpans = container.querySelectorAll('span[style*="font-style: italic"]');
    
    for (let i = 0; i < italicSpans.length; i++) {
      const currentSpan = italicSpans[i] as HTMLElement;

      if (!container.contains(currentSpan)) continue;
      
      let nextSibling = currentSpan.nextSibling;
      
      while (nextSibling) {

        if (
          nextSibling.nodeType === Node.ELEMENT_NODE && 
          (nextSibling as HTMLElement).tagName === 'SPAN' && 
          (nextSibling as HTMLElement).style.fontStyle === 'italic'
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

  const removeItalicFromSpecificRange = (range: Range) => {
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
        
        if (elem.tagName === 'SPAN' && elem.style.fontStyle === 'italic') {
          const hasBold = elem.style.fontWeight === 'bold';
          const hasUnderline = elem.style.textDecorationLine === 'underline';
          
          if (hasBold || hasUnderline) {
            const newSpan = document.createElement('span');
            if (hasBold) {
              newSpan.style.fontWeight = 'bold';
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

  const removeMultiParagraphItalic = (range: Range) => {
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
        removeItalicFromSpecificRange(paragraphRange);
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
        
        removeItalicFromSpecificRange(paragraphRange);
      } 
      else if (paragraph === endParagraph) {
        const paragraphRange = document.createRange();
        
        if (paragraph.firstChild) {
          paragraphRange.setStartBefore(paragraph.firstChild);
        } else {
          paragraphRange.setStartBefore(paragraph);
        }
        
        paragraphRange.setEnd(endContainer, endOffset);
        removeItalicFromSpecificRange(paragraphRange);
      } 
      else {

        const paragraphRange = document.createRange();
        paragraphRange.selectNodeContents(paragraph);
        removeItalicFromSpecificRange(paragraphRange);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };

  const removeItalicFromSelection = (range: Range) => {
    if (!editorRef.current) return;
    
    const originalText = range.toString();
    
    let italicSpan: HTMLElement | null = null;
    let currentNode = range.commonAncestorContainer;
    
    while (currentNode && currentNode !== editorRef.current) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && 
          (currentNode as HTMLElement).tagName === 'SPAN' && 
          (currentNode as HTMLElement).style.fontStyle === 'italic') {
        italicSpan = currentNode as HTMLElement;
        break;
      }
      currentNode = currentNode.parentNode as Node;
    }
    
    if (!italicSpan) return;
    
  
    const hasBold = italicSpan.style.fontWeight === 'bold';
    const hasUnderline = italicSpan.style.textDecorationLine === 'underline';
    
    const fullText = italicSpan.textContent || '';
    
    let startOffsetInSpan = 0;
    let endOffsetInSpan = fullText.length;
    
    if (range.startContainer.nodeType === Node.TEXT_NODE && 
        range.startContainer.parentNode === italicSpan) {
      let node = italicSpan.firstChild;
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
        italicSpan, 
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
        italicSpan, 
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
      beforeSpan.style.fontStyle = 'italic';
      if (hasBold) {
        beforeSpan.style.fontWeight = 'bold';
      }
      if (hasUnderline) {
        beforeSpan.style.textDecorationLine = 'underline';
      }
      beforeSpan.textContent = textBefore;
      nodes.push(beforeSpan);
    }
    
    if (selectedText) {
      if (hasBold || hasUnderline) {
        const styledSpan = document.createElement('span');
        if (hasBold) {
          styledSpan.style.fontWeight = 'bold';
        }
        if (hasUnderline) {
          styledSpan.style.textDecorationLine = 'underline';
        }
        styledSpan.textContent = selectedText;
        nodes.push(styledSpan);
      } else {
        nodes.push(document.createTextNode(selectedText));
      }
    }
    
    if (textAfter) {
      const afterSpan = document.createElement('span');
      afterSpan.style.fontStyle = 'italic';
      if (hasBold) {
        afterSpan.style.fontWeight = 'bold';
      }
      if (hasUnderline) {
        afterSpan.style.textDecorationLine = 'underline';
      }
      afterSpan.textContent = textAfter;
      nodes.push(afterSpan);
    }
    
    const parent = italicSpan.parentNode;
    if (parent) {
      if (nodes.length > 0) {
        parent.replaceChild(nodes[0], italicSpan);
        
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

  const removeItalicFromMultiParagraph = (range: Range) => {

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
            
            if (hasItalic) {
              if (hasBold) {
                const boldSpan = document.createElement('span');
                boldSpan.style.fontWeight = 'bold';
 
                Array.from(elem.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    boldSpan.appendChild(child.cloneNode(true));
                  } else {
                    processNode(child);
                  }
                });
                
                processed.appendChild(boldSpan);
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
            
            if (hasItalic) {
              if (hasBold) {
                const boldSpan = document.createElement('span');
                boldSpan.style.fontWeight = 'bold';

                Array.from(elem.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    boldSpan.appendChild(child.cloneNode(true));
                  } else {
                    processNode(child);
                  }
                });
                
                processedFragment.appendChild(boldSpan);
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

  const applyItalicToMultiParagraph = (range: Range) => {
    const commonAncestor = range.commonAncestorContainer;
    
    const clonedRange = range.cloneRange();
    
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

      const boldSpans = Array.from(fragment.querySelectorAll('span[style*="font-weight: bold"]'));
      const hasBoldSpans = boldSpans.length > 0;
      
      if (hasBoldSpans) {
        boldSpans.forEach(boldSpan => {
          boldSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });
        
        processNonBoldText(fragment);
        
        range.insertNode(fragment);
      } else {
        const italicSpan = document.createElement('span');
        italicSpan.style.fontStyle = 'italic';
        
        while (fragment.firstChild) {
          italicSpan.appendChild(fragment.firstChild);
        }
        
        range.insertNode(italicSpan);
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
      const boldSpans = Array.from(paragraphFragment.querySelectorAll('span[style*="font-weight: bold"]'));
      const hasBoldSpans = boldSpans.length > 0;
      
      if (hasBoldSpans) {

        boldSpans.forEach(boldSpan => {
          boldSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });
        
        processNonBoldText(paragraphFragment);
        
        paragraphRange.insertNode(paragraphFragment);
      } else {
        const italicSpan = document.createElement('span');
        italicSpan.style.fontStyle = 'italic';    

        while (paragraphFragment.firstChild) {
          italicSpan.appendChild(paragraphFragment.firstChild);
        }
        
        paragraphRange.insertNode(italicSpan);
      }
    }
  };

  const applyItalic = (range: Range) => {
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

      applyItalicToMultiParagraph(range);
    } else {
      const fragment = range.extractContents();
      
      const boldSpans = Array.from(fragment.querySelectorAll('span[style*="font-weight: bold"]'));
      const hasBoldSpans = boldSpans.length > 0;
      
      if (hasBoldSpans) {
        boldSpans.forEach(boldSpan => {
          boldSpan.setAttribute('style', 'font-weight: bold; font-style: italic;');
        });
        
        processNonBoldText(fragment);
        
        range.insertNode(fragment);
      } else {
        const italicSpan = document.createElement('span');
        italicSpan.style.fontStyle = 'italic';
        
        while (fragment.firstChild) {
          italicSpan.appendChild(fragment.firstChild);
        }
        range.insertNode(italicSpan);
      }
    }
    
    cleanupEmptySpans(editorRef.current);
  };

  const processNonBoldText = (fragment: DocumentFragment) => {
    const walker = document.createTreeWalker(
      fragment,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (!node.parentElement) return NodeFilter.FILTER_ACCEPT;
          
          if (node.parentElement.tagName === 'SPAN') {
            if (node.parentElement.style.fontWeight === 'bold') {
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
      
      const italicSpan = document.createElement('span');
      italicSpan.style.fontStyle = 'italic';
      
      const parent = textNode.parentNode;
      
      if (parent) {
        italicSpan.textContent = textNode.textContent;
        parent.replaceChild(italicSpan, textNode);
      }
    });
  };
  
  const removeItalic = (range: Range) => {
    if (!editorRef.current) return;
  
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    const isMultiParagraph = 
      startContainer.parentNode !== endContainer.parentNode ||
      (startContainer.nodeType === Node.ELEMENT_NODE && 
       (startContainer as HTMLElement).tagName === 'DIV');
    
    if (isMultiParagraph) {
      removeItalicFromMultiParagraph(range);
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
            
            if (hasItalic) {
              if (hasBold) {
                const boldSpan = document.createElement('span');
                boldSpan.style.fontWeight = 'bold';
                
                Array.from(elem.childNodes).forEach(child => {
                  if (child.nodeType === Node.TEXT_NODE) {
                    boldSpan.appendChild(child.cloneNode(true));
                  } else {
                    processNode(child);
                  }
                });
                
                processedFragment.appendChild(boldSpan);
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

  const checkIfItalic = () => {
    if (!lastSelection) return false;
    
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(lastSelection.cloneContents());
    
    if (!tempSpan.textContent || tempSpan.textContent.trim() === '') {
      return false;
    }
    
    let hasNonItalicText = false;
    const checkNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
 
        if (node.textContent && node.textContent.trim() !== '' && 
            (!node.parentElement || node.parentElement.tagName !== 'SPAN' || 
             node.parentElement.style.fontStyle !== 'italic')) {
          hasNonItalicText = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.fontStyle === 'italic') {
 
          Array.from(node.childNodes).forEach(checkNode);
        } 
   
        else if ((node as HTMLElement).tagName !== 'SPAN' || 
                 (node as HTMLElement).style.fontStyle !== 'italic') {

          if (node.textContent && node.textContent.trim() !== '') {
            const directTextContent = Array.from(node.childNodes)
              .filter(child => child.nodeType === Node.TEXT_NODE)
              .map(child => child.textContent)
              .join('');
            
            if (directTextContent.trim() !== '') {
              hasNonItalicText = true;
            } else {
              Array.from(node.childNodes).forEach(checkNode);
            }
          }
        }
      }
    };
    
    Array.from(tempSpan.childNodes).forEach(checkNode);
    
    return !hasNonItalicText;
  };

  const checkIsItalicActive = (): boolean => {
    if (!lastSelection) return false;
    
    if (lastSelection.collapsed) {
      let node = lastSelection.startContainer;
      
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode as Node;
      }
      
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.fontStyle === 'italic') {
          return true;
        }
        node = node.parentNode as Node;
      }
      
      return false;
    }
    
    return isSelectionCompletelyItalic(lastSelection);
  };
  
  const insertItalicMarker = () => {
    if (!lastSelection || !lastSelection.collapsed || !editorRef.current) return;
    
    const range = lastSelection.cloneRange();
    
    const italicSpan = document.createElement('span');
    italicSpan.style.fontStyle = 'italic';
    
    italicSpan.appendChild(document.createTextNode('\u200B'));
    
    range.insertNode(italicSpan);
    
    range.selectNodeContents(italicSpan);
    range.collapse(false);
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    cleanupEmptySpans(editorRef.current);
    
    saveSelection();
    onContentChange();
  };
  
  const exitItalicContext = () => {
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
    
    let italicSpan: Node | null = range.startContainer;
    
    if (italicSpan.nodeType === Node.TEXT_NODE) {
      italicSpan = italicSpan.parentNode;
    }
    
    while (italicSpan && italicSpan !== paragraph) {
      if (italicSpan.nodeType === Node.ELEMENT_NODE && 
          (italicSpan as HTMLElement).tagName === 'SPAN' && 
          (italicSpan as HTMLElement).style.fontStyle === 'italic') {
        break;
      }
      italicSpan = italicSpan.parentNode;
    }
    
    if (!italicSpan || italicSpan === paragraph) return;
    
    if (italicSpan.nextSibling) {
      paragraph.insertBefore(textNode, italicSpan.nextSibling);
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
  
  const toggleItalicState = () => {
    if (!editorRef.current || !lastSelection) return;
    
    if (lastSelection.collapsed) {
 
      const newState = !checkIsItalicActive();
      setIsActive(newState);
      
      if (newState) {
        insertItalicMarker();
      } else {
        exitItalicContext();
      }
    } else {
      handleExistingItalicLogic();
    }
  };
  
  const handleExistingItalicLogic = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    const isMultiParagraph = isSelectionAcrossMultipleParagraphs(range);
    
    if (isMultiParagraph) {
      const allItalic = areAllParagraphsItalic(range);
      if (allItalic) {
        removeMultiParagraphItalic(range);
      } else {
        applyItalic(range);
      }
    } else {
      const startParent = range.startContainer.parentNode;
      const endParent = range.endContainer.parentNode;
      
      const isWithinItalicSpan = 
        (startParent && startParent.nodeType === Node.ELEMENT_NODE && 
         (startParent as HTMLElement).tagName === 'SPAN' && 
         (startParent as HTMLElement).style.fontStyle === 'italic') || 
        (endParent && endParent.nodeType === Node.ELEMENT_NODE && 
         (endParent as HTMLElement).tagName === 'SPAN' && 
         (endParent as HTMLElement).style.fontStyle === 'italic');
      
      if (isWithinItalicSpan) {
        removeItalicFromSelection(range);
      } else {
        const isEntireSelectionItalic = isSelectionCompletelyItalic(range);
        if (isEntireSelectionItalic) {
          removeItalic(range);
        } else {
          applyItalic(range);
        }
      }
    }
    
    setIsActive(checkIsItalicActive());
  };


  useEffect(() => {
    setIsActive(checkIsItalicActive());
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
  
  const areAllParagraphsItalic = (range: Range): boolean => {
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
      
      return isSelectionCompletelyItalic(range);
    }
    
    for (const paragraph of paragraphs) {
      const paragraphText = paragraph.textContent || '';
      if (paragraphText.trim() === '') continue;
      
      let totalItalicText = '';
      const italicSpans = paragraph.querySelectorAll('span[style*="font-style: italic"]');
      
      for (const span of italicSpans) {
        totalItalicText += span.textContent || '';
      }
      
      if (totalItalicText.trim() !== paragraphText.trim()) {
        return false;
      }
    }
    
    return true;
  };
  
  const isSelectionCompletelyItalic = (range: Range): boolean => {
    const tempSpan = document.createElement('span');
    tempSpan.appendChild(range.cloneContents());
    
    if (!tempSpan.textContent || tempSpan.textContent.trim() === '') {
      return false;
    }
    
    let hasNonItalicText = false;
    
    const checkNode = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent && node.textContent.trim() !== '' && 
            (!node.parentElement || node.parentElement.tagName !== 'SPAN' || 
             node.parentElement.style.fontStyle !== 'italic')) {
          hasNonItalicText = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node as HTMLElement).tagName === 'SPAN' && 
            (node as HTMLElement).style.fontStyle === 'italic') {
          Array.from(node.childNodes).forEach(checkNode);
        } 
        else if ((node as HTMLElement).tagName !== 'SPAN' || 
                 (node as HTMLElement).style.fontStyle !== 'italic') {
          if (node.textContent && node.textContent.trim() !== '') {
            const directTextContent = Array.from(node.childNodes)
              .filter(child => child.nodeType === Node.TEXT_NODE)
              .map(child => child.textContent)
              .join('');
            
            if (directTextContent.trim() !== '') {
              hasNonItalicText = true;
            } else {
              Array.from(node.childNodes).forEach(checkNode);
            }
          }
        }
      }
    };
    
    Array.from(tempSpan.childNodes).forEach(checkNode);    
    return !hasNonItalicText;
  };

  const handleItalicClick = () => {
    if (!editorRef.current) return;
    
    restoreSelection();
    
    toggleItalicState();
    
    saveSelection();
    onContentChange();
  };
  
  return (
    <button 
      className={`toolbar-button italic-button ${isActive ? 'active' : ''}`}
      onClick={handleItalicClick}
      title="Italic"
    >
     <ItalicIcon width={23} height={25} className='Italic' />
    </button>
  );
};

export default Italic;