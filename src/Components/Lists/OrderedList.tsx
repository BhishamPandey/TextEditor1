import React, { useState, useRef, useEffect } from 'react';
import './OrderedList.scss';
import { OrderedListIcon } from '../Icons/Icons';

interface OrderedListProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
  isActive?: boolean;
}


type ListStyleType = 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';

interface ListStyleOption {
  value: ListStyleType;
  label: string;
  icon: string;
}

const OrderedList: React.FC<OrderedListProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange,
  isActive = false
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<ListStyleType>('decimal');
  const [isListActive, setIsListActive] = useState<boolean>(isActive);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const listStyleOptions: ListStyleOption[] = [
    { 
      value: 'decimal', 
      label: '1, 2, 3',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M10 17v-4.8l-1.5 1v-1.1l1.6-1h1.2V17h-1.2Zm3.6.1c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .7.3.7.7 0 .4-.2.7-.7.7Zm-5 5.7c0-1.2.8-2 2.1-2s2.1.8 2.1 1.8c0 .7-.3 1.2-1.4 2.2l-1.1 1v.2h2.6v1H8.6v-.9l2-1.9c.8-.8 1-1.1 1-1.5 0-.5-.4-.8-1-.8-.5 0-.9.3-.9.9H8.5Zm6.3 4.3c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7ZM10 34.4v-1h.7c.6 0 1-.3 1-.8 0-.4-.4-.7-1-.7s-1 .3-1 .8H8.6c0-1.1 1-1.8 2.2-1.8 1.3 0 2.1.6 2.1 1.6 0 .7-.4 1.2-1 1.3v.1c.8.1 1.3.7 1.3 1.4 0 1-1 1.9-2.4 1.9-1.3 0-2.2-.8-2.3-2h1.2c0 .6.5 1 1.1 1 .7 0 1-.4 1-1 0-.5-.3-.8-1-.8h-.7Zm4.7 2.7c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .8.3.8.7 0 .4-.3.7-.8.7Z"></path></g></svg>`
    },
    { 
      value: 'lower-alpha', 
      label: 'a, b, c',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M10.3 15.2c.5 0 1-.4 1-.9V14h-1c-.5.1-.8.3-.8.6 0 .4.3.6.8.6Zm-.4.9c-1 0-1.5-.6-1.5-1.4 0-.8.6-1.3 1.7-1.4h1.1v-.4c0-.4-.2-.6-.7-.6-.5 0-.8.1-.9.4h-1c0-.8.8-1.4 2-1.4 1.1 0 1.8.6 1.8 1.6V16h-1.1v-.6h-.1c-.2.4-.7.7-1.3.7Zm4.6 0c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7Zm-3.2 10c-.6 0-1.2-.3-1.4-.8v.7H8.5v-6.3H10v2.5c.3-.5.8-.9 1.4-.9 1.2 0 1.9 1 1.9 2.4 0 1.5-.7 2.4-1.9 2.4Zm-.4-3.7c-.7 0-1 .5-1 1.3s.3 1.4 1 1.4c.6 0 1-.6 1-1.4 0-.8-.4-1.3-1-1.3Zm4 3.7c-.5 0-.7-.3-.7-.7 0-.4.2-.7.7-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7Zm-2.2 7h-1.2c0-.5-.4-.8-.9-.8-.6 0-1 .5-1 1.4 0 1 .4 1.4 1 1.4.5 0 .8-.2 1-.7h1c0 1-.8 1.7-2 1.7-1.4 0-2.2-.9-2.2-2.4s.8-2.4 2.2-2.4c1.2 0 2 .7 2 1.7Zm1.8 3c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7Z"></path></g></svg>`
    },
    { 
      value: 'upper-alpha', 
      label: 'A, B, C',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="m12.6 17-.5-1.4h-2L9.5 17H8.3l2-6H12l2 6h-1.3ZM11 12.3l-.7 2.3h1.6l-.8-2.3Zm4.7 4.8c-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7.5 0 .7.3.7.7 0 .4-.2.7-.7.7ZM11.4 27H8.7v-6h2.6c1.2 0 1.9.6 1.9 1.5 0 .6-.5 1.2-1 1.3.7.1 1.3.7 1.3 1.5 0 1-.8 1.7-2 1.7ZM10 22v1.5h1c.6 0 1-.3 1-.8 0-.4-.4-.7-1-.7h-1Zm0 4H11c.7 0 1.1-.3 1.1-.8 0-.6-.4-.9-1.1-.9H10V26Zm5.4 1.1c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7Zm-4.1 10c-1.8 0-2.8-1.1-2.8-3.1s1-3.1 2.8-3.1c1.4 0 2.5.9 2.6 2.2h-1.3c0-.7-.6-1.1-1.3-1.1-1 0-1.6.7-1.6 2s.6 2 1.6 2c.7 0 1.2-.4 1.4-1h1.2c-.1 1.3-1.2 2.2-2.6 2.2Zm4.5 0c-.5 0-.8-.3-.8-.7 0-.4.3-.7.8-.7.4 0 .7.3.7.7 0 .4-.3.7-.7.7Z"></path></g></svg>`
    },
    { 
      value: 'lower-roman', 
      label: 'i, ii, iii',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M15.1 16v-1.2h1.3V16H15Zm0 10v-1.2h1.3V26H15Zm0 10v-1.2h1.3V36H15Z"></path><path fill-rule="nonzero" d="M12 21h1.5v5H12zM12 31h1.5v5H12zM9 21h1.5v5H9zM9 31h1.5v5H9zM6 31h1.5v5H6zM12 11h1.5v5H12zM12 19h1.5v1H12zM12 29h1.5v1H12zM9 19h1.5v1H9zM9 29h1.5v1H9zM6 29h1.5v1H6zM12 9h1.5v1H12z"></path></g></svg>`
    },
    { 
      value: 'upper-roman', 
      label: 'I, II, III',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M15.1 17v-1.2h1.3V17H15Zm0 10v-1.2h1.3V27H15Zm0 10v-1.2h1.3V37H15Z"></path><path fill-rule="nonzero" d="M12 20h1.5v7H12zM12 30h1.5v7H12zM9 20h1.5v7H9zM9 30h1.5v7H9zM6 30h1.5v7H6zM12 10h1.5v7H12z"></path></g></svg>`
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    setIsListActive(isActive);
  }, [isActive]);
  
  useEffect(() => {
    const checkActive = () => {
      if (!editorRef.current) return;
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      
      let node = commonAncestor.nodeType === Node.TEXT_NODE ? 
                commonAncestor.parentElement : commonAncestor as HTMLElement;
      
      while (node) {
        if (node.nodeName === 'LI' && node.parentElement?.nodeName === 'OL') {
          setIsListActive(true);
          return;
        }

        if (node.nodeName === 'OL' || 
            (node.nodeName === 'P' && node.querySelector('ol'))) {
          setIsListActive(true);
          return;
        }
        node = node.parentElement;
      }
      
      setIsListActive(false);
    };
    
    // Check on selection change
    const handleSelectionChange = () => {
      checkActive();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
    // Initial check
    checkActive();
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editorRef]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const selectListStyle = (style: ListStyleType) => {
    setSelectedStyle(style);
    applyOrderedList(style);
  };

  const applyOrderedList = (listStyle: ListStyleType = selectedStyle) => {
    if (!editorRef.current) return;

    let currentSelection = window.getSelection();
    
    if (!currentSelection || currentSelection.rangeCount === 0) {
      if (lastSelection) {
        const newSelection = window.getSelection();
        if (newSelection) {
          newSelection.removeAllRanges();
          newSelection.addRange(lastSelection);
          currentSelection = newSelection;
        } else {
          return;
        }
      } else {
        return;
      }
    }
    
    if (isListActive && getCurrentListStyle() === listStyle) {
      setIsListActive(false);
    } else {
      setIsListActive(true);
      setSelectedStyle(listStyle);
    }

    if (!currentSelection || currentSelection.rangeCount === 0) return;

    saveSelection();

    const range = currentSelection.getRangeAt(0);
    const selectedText = range.toString();
    const commonAncestor = range.commonAncestorContainer;

    const parentUl = findClosestList(commonAncestor, 'UL');
    if (parentUl && editorRef.current.contains(parentUl)) {

      const ol = document.createElement('ol');
      ol.style.listStyleType = listStyle;
      
      while (parentUl.firstChild) {
        ol.appendChild(parentUl.firstChild);
      }
      
      parentUl.parentNode?.replaceChild(ol, parentUl);
      onContentChange();
      restoreSelection();
      return;
    }

    let blockElement = null;
    if (commonAncestor.nodeType === Node.TEXT_NODE) {
      blockElement = commonAncestor.parentElement;
    } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
      blockElement = commonAncestor as HTMLElement;
    }

    const parentOl = blockElement?.closest('ol');
    if (parentOl && editorRef.current.contains(parentOl)) {
      if (parentOl.style.listStyleType !== listStyle) {
        parentOl.style.listStyleType = listStyle;
        onContentChange();
        restoreSelection();
        return;
      }
      
      const items = Array.from(parentOl.children);
      const fragment = document.createDocumentFragment();

      items.forEach(item => {
        const p = document.createElement('p');
        while (item.firstChild) {
          p.appendChild(item.firstChild);
        }
        fragment.appendChild(p);
      });

      parentOl.parentNode?.replaceChild(fragment, parentOl);
      onContentChange();
      restoreSelection();
      return;
    }

    const blocks: HTMLElement[] = [];
    let currentElement = blockElement;

    if (selectedText.includes('\n') || range.collapsed === false) {
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node) => {
            const element = node as HTMLElement;
            const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'];
            if (blockTags.includes(element.tagName) && 
                range.intersectsNode(element)) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );

      let element;
      while (element = walker.nextNode()) {
        blocks.push(element as HTMLElement);
      }
    } else {
      while (currentElement && !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(currentElement.tagName)) {
        currentElement = currentElement.parentElement;
      }
      if (currentElement) {
        blocks.push(currentElement);
      }
    }

    if (blocks.length === 0) {
      const p = document.createElement('p');
      const selectedContent = range.extractContents();
      p.appendChild(selectedContent);
      range.insertNode(p);
      blocks.push(p);
    }

    if (blocks.length === 1 && blocks[0].tagName === 'P') {
      const p = blocks[0];
      const ol = document.createElement('ol');
      ol.style.listStyleType = listStyle;
      
      const li = document.createElement('li');
      
      while (p.firstChild) {
        li.appendChild(p.firstChild);
      }
      
      ol.appendChild(li);
      
      p.appendChild(ol);
      
      onContentChange();
      restoreSelection();
      return;
    }

    const firstBlock = blocks[0];
    const previousSibling = firstBlock.previousElementSibling;
    const nextSibling = blocks[blocks.length - 1].nextElementSibling;

    let targetOl: HTMLOListElement | null = null;

    if (previousSibling && previousSibling.tagName === 'OL') {
      targetOl = previousSibling as HTMLOListElement;
    }
    else if (nextSibling && nextSibling.tagName === 'OL') {
      targetOl = nextSibling as HTMLOListElement;
    }

    if (targetOl) {
      targetOl.style.listStyleType = listStyle;
      
      blocks.forEach(block => {
        const li = document.createElement('li');
        
        while (block.firstChild) {
          li.appendChild(block.firstChild);
        }
        
        if (previousSibling && previousSibling === targetOl) {
          targetOl.appendChild(li);
        } else {
          targetOl.insertBefore(li, targetOl.firstChild);
        }
        
        block.parentNode?.removeChild(block);
      });
    } else {
      const ol = document.createElement('ol');
      ol.style.listStyleType = listStyle;
      
      blocks.forEach(block => {
        const li = document.createElement('li');
        
        while (block.firstChild) {
          li.appendChild(block.firstChild);
        }
        
        ol.appendChild(li);
      });

      blocks[0].parentNode?.replaceChild(ol, blocks[0]);

      for (let i = 1; i < blocks.length; i++) {
        blocks[i].parentNode?.removeChild(blocks[i]);
      }
    }

    restoreSelection();
    
    onContentChange();
  };

  const findClosestList = (element: Node, listType: 'UL' | 'OL'): HTMLElement | null => {
    let current = element;
    
    if (current.nodeType === Node.TEXT_NODE) {
      current = current.parentElement || current;
    }
    
    while (current && current.nodeName !== listType) {
      if (current.parentElement) {
        current = current.parentElement;
      } else {
        return null;
      }
    }
    
    return current as HTMLElement || null;
  };
  

  const getCurrentListStyle = (): ListStyleType => {
    if (!editorRef.current) return 'decimal';
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 'decimal';
    
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    
    let node = commonAncestor.nodeType === Node.TEXT_NODE ? 
              commonAncestor.parentElement : commonAncestor as HTMLElement;
    
    while (node) {
      if (node.nodeName === 'OL') {
        const style = node.style.listStyleType;
        if (style) {
          return style as ListStyleType;
        }
        break;
      }
      // Check if we're in a paragraph with a nested ol
      if (node.nodeName === 'P') {
        const nestedOl = node.querySelector('ol');
        if (nestedOl) {
          const style = nestedOl.style.listStyleType;
          if (style) {
            return style as ListStyleType;
          }
        }
      }
      node = node.parentElement;
    }
    
    return 'decimal'; // Default
  };

  return (
    <div className="ordered-list-container" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`toolbar-button ordered-list-button ${isListActive ? 'active' : ''}`}
        title="Ordered List (Ctrl+Shift+7)"
      >
        <OrderedListIcon className="orderedList-Icon" width={30} height={30} />
      </button>
      
      {showDropdown && (
        <div className="ordered-list-dropdown">
          {listStyleOptions.map((option) => (
            <button
              key={option.value}
              className={`dropdown-item ${selectedStyle === option.value ? 'active' : ''}`}
              onClick={() => selectListStyle(option.value)}
            >
              {/* <div className="list-style-icon" dangerouslySetInnerHTML={{ __html: option.icon }} /> */}
              <span className="list-style-label">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderedList;