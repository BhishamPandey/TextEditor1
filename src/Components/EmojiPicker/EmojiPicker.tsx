import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import './EmojiPicker.scss';
import { EmojiIcon } from '../Icons/Icons';

interface EmojiPickerComponentProps {
  editorRef: React.RefObject<HTMLDivElement  | null>;
  lastSelection: Range | null;
  onSelectionChange?: () => void;
  onContentChange?: () => void;
  saveSelection?: () => void;
  restoreSelection?: () => void;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({ 
  editorRef, 
  // lastSelection,
  // onSelectionChange,
  onContentChange,
  saveSelection,
  restoreSelection
}) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  const handleEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
   
    insertEmojiAtCursor(emojiData.emoji);
    setShowPicker(false);
  };
  
  const insertEmojiAtCursor = (emoji: string) => {
  
    if (editorRef.current) {
      editorRef.current.focus();
      
   
      if (restoreSelection) {
        restoreSelection();
      }
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      
     
      range.deleteContents();
      const emojiNode = document.createTextNode(emoji);
      range.insertNode(emojiNode);
      
     
      range.setStartAfter(emojiNode);
      range.setEndAfter(emojiNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (saveSelection) {
        saveSelection();
      }
      
      if (onContentChange) {
        onContentChange();
      }
    }
  };

  return (
    <div className="emoji-picker-container">
      <button 
        ref={buttonRef}
        className="emoji-button"
        onClick={togglePicker}
        title="Insert Emoji"
      >
        <EmojiIcon fill="#5F6368" width="28px" height="28px" className='button'/>
      </button>
      
      {showPicker && (
        <div className="emoji-picker-dropdown" ref={pickerRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchPlaceholder="Search emoji..."
            width={300}
            height={400}
            theme={Theme.LIGHT}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;