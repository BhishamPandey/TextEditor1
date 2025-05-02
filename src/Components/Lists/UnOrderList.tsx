import React, { useState, useRef, useEffect } from 'react';
import './UnorderedList.scss';
import { UnorderedListIcon } from '../Icons/Icons';

interface UnorderedListProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection: () => void;
  restoreSelection: () => void;
  onContentChange: () => void;
  isActive?: boolean;
}


type ListStyleType = 'disc' | 'circle' | 'square';

interface ListStyleOption {
  value: ListStyleType;
  label: string;
  icon: string;
}

const UnorderedList: React.FC<UnorderedListProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange,
  isActive = false
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<ListStyleType>('disc');
  const [isListActive, setIsListActive] = useState<boolean>(isActive);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const listStyleOptions: ListStyleOption[] = [
    { 
      value: 'disc', 
      label: 'Disc',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M9 13a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"></path></g></svg>`
    },
    { 
      value: 'circle', 
      label: 'Circle',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M9 11a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill-rule="nonzero"></path></g></svg>`
    },
    { 
      value: 'square', 
      label: 'Square',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" focusable="false"><g fill-rule="evenodd"><path opacity=".2" d="M18 12h22v4H18zM18 22h22v4H18zM18 32h22v4H18z"></path><path d="M7 13a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0V13zm0 10a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0v-4zm0 10a2 2 0 1 1 4 0v4a2 2 0 1 1-4 0v-4z" fill-rule="nonzero"></path></g></svg>`
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
        if (node.nodeName === 'LI' && node.parentElement?.nodeName === 'UL') {
          setIsListActive(true);
          return;
        }
     
        if (node.nodeName === 'UL' || 
            (node.nodeName === 'P' && node.querySelector('ul'))) {
          setIsListActive(true);
          return;
        }
        node = node.parentElement;
      }
      
      setIsListActive(false);
    };
    
    const handleSelectionChange = () => {
      checkActive();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    
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
    applyUnorderedList(style);
  };

  const applyUnorderedList = (listStyle: ListStyleType = selectedStyle) => {
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

    const parentOl = findClosestList(commonAncestor, 'OL');
    if (parentOl && editorRef.current.contains(parentOl)) {
      const ul = document.createElement('ul');
      ul.style.listStyleType = listStyle;
      
      while (parentOl.firstChild) {
        ul.appendChild(parentOl.firstChild);
      }
      
      parentOl.parentNode?.replaceChild(ul, parentOl);
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

    const parentUl = blockElement?.closest('ul');
    if (parentUl && editorRef.current.contains(parentUl)) {
      if (parentUl.style.listStyleType !== listStyle) {
        parentUl.style.listStyleType = listStyle;
        onContentChange();
        restoreSelection();
        return;
      }
      
      const items = Array.from(parentUl.children);
      const fragment = document.createDocumentFragment();

      items.forEach(item => {
        const p = document.createElement('p');
        while (item.firstChild) {
          p.appendChild(item.firstChild);
        }
        fragment.appendChild(p);
      });

      parentUl.parentNode?.replaceChild(fragment, parentUl);
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
      const ul = document.createElement('ul');
      ul.style.listStyleType = listStyle;
      
      const li = document.createElement('li');
      
      while (p.firstChild) {
        li.appendChild(p.firstChild);
      }
      
      ul.appendChild(li);
      
      p.appendChild(ul);
      
      onContentChange();
      restoreSelection();
      return;
    }

    const firstBlock = blocks[0];
    const previousSibling = firstBlock.previousElementSibling;
    const nextSibling = blocks[blocks.length - 1].nextElementSibling;

    let targetUl: HTMLUListElement | null = null;

    if (previousSibling && previousSibling.tagName === 'UL') {
      targetUl = previousSibling as HTMLUListElement;
    }
    else if (nextSibling && nextSibling.tagName === 'UL') {
      targetUl = nextSibling as HTMLUListElement;
    }

    if (targetUl) {
      targetUl.style.listStyleType = listStyle;
      
      blocks.forEach(block => {
        const li = document.createElement('li');
        
        while (block.firstChild) {
          li.appendChild(block.firstChild);
        }
        
        if (previousSibling && previousSibling === targetUl) {
          targetUl.appendChild(li);
        } else {
          targetUl.insertBefore(li, targetUl.firstChild);
        }
        
        block.parentNode?.removeChild(block);
      });
    } else {
      const ul = document.createElement('ul');
      ul.style.listStyleType = listStyle;
      
      blocks.forEach(block => {
        const li = document.createElement('li');
        
        while (block.firstChild) {
          li.appendChild(block.firstChild);
        }
        
        ul.appendChild(li);
      });

      blocks[0].parentNode?.replaceChild(ul, blocks[0]);

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
    if (!editorRef.current) return 'disc';
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 'disc';
    
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;
    
    let node = commonAncestor.nodeType === Node.TEXT_NODE ? 
              commonAncestor.parentElement : commonAncestor as HTMLElement;
    
    while (node) {
      if (node.nodeName === 'UL') {
        const style = node.style.listStyleType;
        if (style) {
          return style as ListStyleType;
        }
        break;
      }
      // Check if we're in a paragraph with a nested ul
      if (node.nodeName === 'P') {
        const nestedUl = node.querySelector('ul');
        if (nestedUl) {
          const style = nestedUl.style.listStyleType;
          if (style) {
            return style as ListStyleType;
          }
        }
      }
      node = node.parentElement;
    }
    
    return 'disc'; 
  };

  return (
    <div className="unordered-list-container" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`toolbar-button unordered-list-button ${isListActive ? 'active' : ''}`}
        title="Unordered List (Ctrl+Shift+8)"
      >
        <UnorderedListIcon height={28} width={28} className='' />
      </button>
      
      {showDropdown && (
        <div className="unordered-list-dropdown">
          {listStyleOptions.map((option) => (
            <button
              key={option.value}
              className={`dropdown-item ${selectedStyle === option.value ? 'active' : ''}`}
              onClick={() => selectListStyle(option.value)}
            >
              <span className="list-style-label">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnorderedList;