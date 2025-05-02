import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import './TextColour.scss'
import { TextColourIcon } from '../Icons/Icons';

interface TextColorProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const TextColor: React.FC<TextColorProps> = ({
  editorRef,
  // lastSelection, 
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const colorPalette = [
    ['#000000', '#964B00', '#2A3C24', '#004D00', '#002D62', '#00008B', '#4B0082', '#3C3C3C'],
    ['#8B0000', '#FF7F00', '#808000', '#008000', '#008080', '#0000FF', '#800080', '#808080'],
    ['#FF0000', '#FFA500', '#32CD32', '#00FF00', '#40E0D0', '#1E90FF', '#8A2BE2', '#C0C0C0'],
    ['#FF00FF', '#FFD700', '#FFFF00', '#00FF00', '#00FFFF', '#00BFFF', '#800020', '#D3D3D3'],
    ['#FFC0CB', '#FFDAB9', '#FFFACD', '#98FB98', '#AFEEEE', '#B0E0E6', '#E6E6FA', '#FFFFFF'],
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        colorPickerRef.current && 
        !colorPickerRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleColorPicker = () => {
    setIsOpen(!isOpen);
    setShowCustomPicker(false);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    applyTextColor(color);
    setIsOpen(false);
  };

  const handleCustomColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleCustomColorApply = () => {
    applyTextColor(selectedColor);
    setIsOpen(false);
    setShowCustomPicker(false);
  };

  const showMoreColors = () => {
    setShowCustomPicker(true);
  };

  const handleAutomatic = () => {
    applyTextColor('inherit');
    setIsOpen(false);
  };

  const applyTextColor = (color: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      if (restoreSelection) {
        restoreSelection();
      }
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      
      if (range.collapsed) {
        return;
      }

      applyColorToRange(range, color);
      
      if (onContentChange) {
        onContentChange();
      }
      
      if (saveSelection) {
        saveSelection();
      }
    }
  };
  
  const applyColorToSingleRange = (range: Range, color: string) => {
    const startNode = range.startContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    if (startNode.nodeType === Node.TEXT_NODE) {
      const textContent = startNode.textContent || '';
      const parentNode = startNode.parentNode as HTMLElement;
      
      const isColorSpan = 
        parentNode && 
        parentNode.nodeName === 'SPAN' && 
        (parentNode.style.color || parentNode.classList.contains('default-text-color'));
      
      const isFullNodeSelected = startOffset === 0 && endOffset === textContent.length;
      
      if (isColorSpan) {
        if (isFullNodeSelected) {
   
          if (color === 'inherit') {
            parentNode.style.color = '';
            parentNode.className = 'default-text-color';
          } else {
            parentNode.style.color = color;
            parentNode.classList.remove('default-text-color');
          }
        } else {

          const beforeText = textContent.substring(0, startOffset);
          const selectedText = textContent.substring(startOffset, endOffset);
          const afterText = textContent.substring(endOffset);
          
          const beforeSpan = document.createElement('span');
          beforeSpan.style.color = parentNode.style.color;
          beforeSpan.textContent = beforeText;
          
          const selectedSpan = document.createElement('span');
          if (color === 'inherit') {
            selectedSpan.style.color = '';
            selectedSpan.className = 'default-text-color';
          } else {
            selectedSpan.style.color = color;
          }
          selectedSpan.textContent = selectedText;
          
          const afterSpan = document.createElement('span');
          afterSpan.style.color = parentNode.style.color;
          afterSpan.textContent = afterText;
          
          const fragment = document.createDocumentFragment();
          
          if (beforeText) fragment.appendChild(beforeSpan);
          fragment.appendChild(selectedSpan);
          if (afterText) fragment.appendChild(afterSpan);
          
          const grandparent = parentNode.parentNode;
          if (grandparent) {
            grandparent.replaceChild(fragment, parentNode);
            
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              const newRange = document.createRange();
              newRange.setStartAfter(selectedSpan);
              newRange.setEndAfter(selectedSpan);
              selection.addRange(newRange);
            }
          }
        }
      } else {
  
        const newTextBefore = document.createTextNode(textContent.substring(0, startOffset));
        const newColorSpan = document.createElement('span');
        
        if (color === 'inherit') {
          newColorSpan.style.color = '';
          newColorSpan.className = 'default-text-color';
        } else {
          newColorSpan.style.color = color;
        }
        
        newColorSpan.textContent = textContent.substring(startOffset, endOffset);
        const newTextAfter = document.createTextNode(textContent.substring(endOffset));
        
        const parent = startNode.parentNode;
        if (parent) {
      
          if (startOffset > 0) {
            parent.insertBefore(newTextBefore, startNode);
          }
                  
          parent.insertBefore(newColorSpan, startNode);       
         
          if (endOffset < textContent.length) {
            parent.insertBefore(newTextAfter, startNode);
          }       
          
          parent.removeChild(startNode);
          
          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(newColorSpan);
            newRange.setEndAfter(newColorSpan);
            selection.addRange(newRange);
          }
        }
      }
    } else if (startNode.nodeType === Node.ELEMENT_NODE) {
     
      const fragment = range.extractContents();
      
      const newSpan = document.createElement('span');
      if (color === 'inherit') {
        newSpan.style.color = '';
        newSpan.className = 'default-text-color';
      } else {
        newSpan.style.color = color;
      }
      
      newSpan.appendChild(fragment);
      
      range.insertNode(newSpan);
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(newSpan);
        newRange.setEndAfter(newSpan);
        selection.addRange(newRange);
      }
    }
  };
  
  const applyColorToRange = (range: Range, color: string) => {
    const startNode = range.startContainer;
    const endNode = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    if (startNode !== endNode) {
      // const rangeClone = range.cloneRange();
      const selectionParent = range.commonAncestorContainer;
      let currentNode: Node | null = null;
      
      if (selectionParent.nodeType === Node.TEXT_NODE) {
        currentNode = selectionParent.parentNode;
      } else {
        currentNode = selectionParent;
      }
      
      const textNodesInRange: Node[] = [];
      
      const collectTextNodes = (node: Node) => {
       
        if (!range.intersectsNode(node)) return;
        
        if (node.nodeType === Node.TEXT_NODE) {
          
          textNodesInRange.push(node);
        } else {
         
          Array.from(node.childNodes).forEach(child => {
            collectTextNodes(child);
          });
        }
      };
      
     
      if (currentNode) {
        collectTextNodes(currentNode);
      }
      
      for (const textNode of textNodesInRange) {
    
        const textNodeRange = document.createRange();
        
        if (textNode === startNode) {
          textNodeRange.setStart(textNode, startOffset);
          textNodeRange.setEnd(textNode, textNode === endNode ? endOffset : (textNode.textContent?.length || 0));
        } else if (textNode === endNode) {
          textNodeRange.setStart(textNode, 0);
          textNodeRange.setEnd(textNode, endOffset);
        } else {
         
          textNodeRange.selectNodeContents(textNode);
        }
        
        if (textNodeRange.collapsed) continue;
        
        const selectedText = textNodeRange.toString();
        if (!selectedText || selectedText.trim() === '') continue;
        
        const span = document.createElement('span');
        if (color === 'inherit') {
          span.style.color = '';
          span.className = 'default-text-color';
        } else {
          span.style.color = color;
        }
        
        span.textContent = selectedText;
        
        const parent = textNode.parentNode;
        if (!parent) continue;
        
        const originalText = textNode.textContent || '';
        
        if (textNode === startNode && startOffset > 0) {
          const beforeText = originalText.substring(0, startOffset);
          const beforeTextNode = document.createTextNode(beforeText);
          parent.insertBefore(beforeTextNode, textNode);
        }
        
        parent.insertBefore(span, textNode);
        
        if (textNode === endNode && endOffset < originalText.length) {
          const afterText = originalText.substring(endOffset);
          const afterTextNode = document.createTextNode(afterText);
          parent.insertBefore(afterTextNode, textNode);
        }
        
        parent.removeChild(textNode);
      }
      
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
    
        const newRange = document.createRange();
        newRange.setStart(range.endContainer, range.endOffset);
        newRange.collapse(true);
        selection.addRange(newRange);
      }
      
      return;
    }
    
    applyColorToSingleRange(range, color);
  };

  const getColorPreviewStyle = () => {
    return {
      backgroundColor: selectedColor === 'inherit' ? '#000000' : selectedColor
    };
  };

  return (
    <div className="text-color-container">
      <button 
        ref={buttonRef}
        className="text-color-button"
        onClick={toggleColorPicker}
        title="Text Color"
        aria-label="Text Color"
      >
       <TextColourIcon height={28} width={26} className='TextColorIcon'/>
        {/* <span className="color-preview" style={getColorPreviewStyle()}></span> */}
      </button>
      
      {isOpen && (
        <div className="color-picker-dropdown" ref={colorPickerRef} role="dialog" aria-label="Color picker">
          {!showCustomPicker ? (
            <>
              <div 
                className="color-option automatic" 
                onClick={handleAutomatic}
                role="button"
                tabIndex={0}
                aria-label="Automatic (default text color)"
              >
                <div className="automatic-box"></div>
                <span>Automatic</span>
              </div>
              
              <div className="color-palette" role="grid">
                {colorPalette.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="color-row" role="row">
                    {row.map((color, colorIndex) => (
                      <div 
                        key={`color-${rowIndex}-${colorIndex}`}
                        className="color-square"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`Color ${color}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
              
              <div 
                className="more-colors-option" 
                onClick={showMoreColors}
                role="button"
                tabIndex={0}
                aria-label="Show more colors"
              >
                <div className="more-colors-box"></div>
                <span>More</span>
              </div>
            </>
          ) : (
            <div className="custom-color-picker">
              <HexColorPicker color={selectedColor} onChange={handleCustomColorSelect} />
              <button 
                className="apply-color-button"
                onClick={handleCustomColorApply}
                aria-label="Apply selected color"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextColor;