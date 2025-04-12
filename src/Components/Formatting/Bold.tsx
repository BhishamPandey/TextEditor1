import React, { useState, useRef, useEffect } from 'react';

interface BoldProps { }

const Bold: React.FC<BoldProps> = () => {
  const [isActive, setIsActive] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const foundEditor = document.querySelector('[contenteditable]');
    if (foundEditor instanceof HTMLDivElement) {
      editorRef.current = foundEditor;
    }
  }, []);

  const checkIfSelectionIsBold = (selection: Selection): boolean => {
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    const elementToCheck =
      commonAncestor.nodeType === Node.TEXT_NODE
        ? commonAncestor.parentElement
        : (commonAncestor as Element);

    if (!elementToCheck) return false;

    return (
      elementToCheck.tagName === 'STRONG' ||
      elementToCheck.tagName === 'B' ||
      (elementToCheck instanceof HTMLElement &&
        (elementToCheck.style.fontWeight === 'bold' ||
          elementToCheck.style.fontWeight === '700')) ||
      !!elementToCheck.closest('strong, b')
    );
  };

  const normalizeDOM = (element: HTMLElement) => {
    const treeWalker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: node =>
          node.nodeValue?.trim() === '' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    );

    const emptyTextNodes: Node[] = [];
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      emptyTextNodes.push(currentNode);
      currentNode = treeWalker.nextNode();
    }
    emptyTextNodes.forEach(node => node.parentNode?.removeChild(node));

    const emptyElements = element.querySelectorAll('*:not(br):empty');
    emptyElements.forEach(el => el.parentNode?.removeChild(el));

    element.normalize();
  };

  const addBoldFormatting = (range: Range, selection: Selection) => {
    const strongElement = document.createElement('strong');
    const extractedContent = range.extractContents();
    strongElement.appendChild(extractedContent);
    range.insertNode(strongElement);

    const newRange = document.createRange();
    newRange.selectNodeContents(strongElement);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };

  const processBoldElements = (element: Element) => {
    const boldElements = element.querySelectorAll('strong, b');
    boldElements.forEach(boldElement => {
      const fragment = document.createDocumentFragment();
      while (boldElement.firstChild) {
        const child = boldElement.firstChild;
        if (
          child.nodeType === Node.ELEMENT_NODE &&
          ((child as HTMLElement).style.fontWeight === 'bold' ||
            (child as HTMLElement).style.fontWeight === '700')
        ) {
          (child as HTMLElement).style.fontWeight = '';
        }
        fragment.appendChild(child);
      }
      boldElement.parentNode?.replaceChild(fragment, boldElement);
    });

    const styledElements = element.querySelectorAll('[style*="font-weight"]');
    styledElements.forEach(el => {
      const elStyle = el as HTMLElement;
      if (elStyle.style.fontWeight === 'bold' || elStyle.style.fontWeight === '700') {
        elStyle.style.fontWeight = '';
        if (elStyle.style.length === 0) elStyle.removeAttribute('style');
      }
    });
  };


  // const unwrapBoldFromSelection = () => {
  //   const selection = window.getSelection();
  //   if (!selection || selection.rangeCount === 0) return;

  //   const range = selection.getRangeAt(0);

  //   // Walk through all nodes in the range and unwrap <strong> or <b>
  //   const treeWalker = document.createTreeWalker(
  //     range.commonAncestorContainer,
  //     NodeFilter.SHOW_ELEMENT,
  //     {
  //       acceptNode: node => {
  //         const el = node as HTMLElement;
  //         if ((el.tagName === 'STRONG' || el.tagName === 'B') && range.intersectsNode(el)) {
  //           return NodeFilter.FILTER_ACCEPT;
  //         }
  //         return NodeFilter.FILTER_SKIP;
  //       },
  //     }
  //   );

  //   const boldNodes: HTMLElement[] = [];
  //   while (treeWalker.nextNode()) {
  //     boldNodes.push(treeWalker.currentNode as HTMLElement);
  //   }

  //   boldNodes.forEach(boldNode => {
  //     const parent = boldNode.parentNode!;
  //     while (boldNode.firstChild) {
  //       parent.insertBefore(boldNode.firstChild, boldNode);
  //     }
  //     parent.removeChild(boldNode);
  //   });

  //   // Optionally normalize the selection
  //   selection.removeAllRanges();
  //   selection.addRange(range);
  // };




  const removeBoldFormatting = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log("No selection detected");
      return;
    }
   
    const range = selection.getRangeAt(0);
    console.log("Selected text:", selection.toString());
    
    // Find elements with any type of bold formatting
    const findBoldElements = (node: Node): Element[] => {
      if (!node || !range.intersectsNode(node)) return [];
      
      const boldElements: Element[] = [];
      
      // Check if this is an element node within the range
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const computedStyle = window.getComputedStyle(element);
        const fontWeight = computedStyle.getPropertyValue('font-weight');
        
        // Check for all possible bold formatting methods
        const isBold = 
          element.nodeName === 'STRONG' || 
          element.nodeName === 'B' ||
          parseInt(fontWeight) >= 600 || 
          fontWeight === 'bold' || 
          fontWeight === 'bolder';
        
        if (isBold && range.intersectsNode(element)) {
          console.log("Found bold element:", element.outerHTML);
          console.log("Font weight:", fontWeight);
          boldElements.push(element);
        }
        
        // Check children
        Array.from(node.childNodes).forEach(child => {
          const childBoldElements = findBoldElements(child);
          boldElements.push(...childBoldElements);
        });
      } else if (node.hasChildNodes()) {
        // Check children of non-element nodes
        Array.from(node.childNodes).forEach(child => {
          const childBoldElements = findBoldElements(child);
          boldElements.push(...childBoldElements);
        });
      }
      
      return boldElements;
    };
    
    // If commonAncestorContainer is a text node, we need to start from its parent
    const container = range.commonAncestorContainer;
    const startNode = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
    
    if (!startNode) {
      console.log("Could not determine a valid starting node");
      return;
    }
    
    // Log structure for debugging
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(range.cloneContents());
    console.log("Selection HTML structure:", tempDiv.innerHTML);
    console.log("Common ancestor:", startNode.nodeName);
    
    // Find all bold elements
    const boldElements = findBoldElements(startNode);
    console.log(`Found ${boldElements.length} bold elements in the selection`);
    
    if (boldElements.length > 0) {
      // For elements that are actually <strong> or <b>, unwrap them
      boldElements.filter(el => el.nodeName === 'STRONG' || el.nodeName === 'B')
        .forEach(boldEl => {
          const parent = boldEl.parentNode;
          if (!parent) return;
          
          console.log(`Unwrapping bold tag: ${boldEl.outerHTML}`);
          while (boldEl.firstChild) {
            parent.insertBefore(boldEl.firstChild, boldEl);
          }
          parent.removeChild(boldEl);
        });
      
      // For elements with CSS-based bold formatting, remove the bold style
      boldElements.filter(el => el.nodeName !== 'STRONG' && el.nodeName !== 'B')
        .forEach(styledEl => {
          console.log(`Removing bold style from: ${styledEl.outerHTML}`);
          
          // Remove inline font-weight style if present
          if ((styledEl as HTMLElement).style && (styledEl as HTMLElement).style.fontWeight) {
            (styledEl as HTMLElement).style.fontWeight = 'normal';
          }
          
          // Alternative: use a span to override the font weight
          const span = document.createElement('span');
          span.style.fontWeight = 'normal';
          
          // Only apply to text directly in this element (avoid affecting nested elements)
          Array.from(styledEl.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE && range.intersectsNode(child)) {
              const normalText = document.createTextNode(child.textContent || "");
              span.appendChild(normalText);
              styledEl.replaceChild(span, child);
            }
          });
        });
      
      // Normalize text nodes
      range.commonAncestorContainer.normalize();
      console.log("Bold formatting removed successfully");
    } else {
      console.log("No bold elements found in the selection");
      
      // Additional debugging
      if (startNode.parentNode instanceof Element) {
        console.log("Parent element HTML:", (startNode.parentNode as Element).outerHTML);
      } else {
        console.log("Parent is not an Element node");
      }
    }
    
    // Create a new selection to preserve user's selection
    const newRange = document.createRange();
    newRange.setStart(range.startContainer, range.startOffset);
    newRange.setEnd(range.endContainer, range.endOffset);
    selection.removeAllRanges();
    selection.addRange(newRange);
  };



  const handleBoldClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) {
      setIsActive(checkIfSelectionIsBold(selection));
      return;
    }

    const isCurrentlyBold = checkIfSelectionIsBold(selection);

    if (isCurrentlyBold) {
      removeBoldFormatting();
    } else {
      addBoldFormatting(range, selection);
    }

    normalizeDOM(editorRef.current);
    editorRef.current.focus();
    setIsActive(!isCurrentlyBold);
  };

  return (
    <button
      onClick={handleBoldClick}
      style={{ fontWeight: isActive ? 'bold' : 'normal' }}
      title="Bold"
    >
      B
    </button>
  );
};

export default Bold;
