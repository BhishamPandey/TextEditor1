import React, { useState, useEffect } from 'react';
import './Undo.scss';
import { EditorHistory } from './EditorHistory';
import { UndoIcon } from '../Icons/Icons';

interface UndoProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection?: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const Undo: React.FC<UndoProps> = ({
  editorRef,
  // lastSelection,
  // saveSelection,
  // restoreSelection,
  onContentChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const history = EditorHistory.getInstance();

  useEffect(() => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    
 
    if (editor) {
      history.recordState(editor.innerHTML, window.getSelection(), editor);
    }
    
   
    let recordTimeout: number | null = null;
    const debouncedRecord = () => {
      if (recordTimeout) clearTimeout(recordTimeout);
      recordTimeout = setTimeout(() => {
        if (editor) {
          const currentHTML = editor.innerHTML;
          const currentSelection = window.getSelection();
         
          if (history.currentIndex >= 0) {
            const lastEntry = history.history[history.currentIndex];
            if (lastEntry.html !== currentHTML) {
              history.recordState(currentHTML, currentSelection, editor);
            }
          } else {
            history.recordState(currentHTML, currentSelection, editor);
          }
        }
      }, 300);
    };
    
    const inputHandler = () => debouncedRecord();
    
    const keyHandler = (e: KeyboardEvent) => {
   
      const key = e.key;
      if (key === ' ' || key === 'Enter' || key === 'Backspace' || key === 'Delete') {
        if (editor) {
         
          if (recordTimeout) clearTimeout(recordTimeout);
          
          const currentHTML = editor.innerHTML;
          const currentSelection = window.getSelection();
          
          
          if (history.currentIndex >= 0) {
            const lastEntry = history.history[history.currentIndex];
            if (lastEntry.html !== currentHTML) {
              history.recordState(currentHTML, currentSelection, editor);
            }
          } else {
            history.recordState(currentHTML, currentSelection, editor);
          }
        }
      }
    };
    
    const observer = new MutationObserver(() => {
      debouncedRecord();
    });
    
    observer.observe(editor, { 
      childList: true, 
      subtree: true, 
      characterData: true, 
      attributes: true 
    });
    
    editor.addEventListener('input', inputHandler);
    editor.addEventListener('keyup', keyHandler);
    
    const updateActiveState = () => {
      setIsActive(history.canUndo());
    };
    
    history.addChangeListener(updateActiveState);
    
    
    return () => {
      if (recordTimeout) clearTimeout(recordTimeout);
      editor.removeEventListener('input', inputHandler);
      editor.removeEventListener('keyup', keyHandler);
      observer.disconnect();
      history.removeChangeListener(updateActiveState);
    };
  }, [editorRef]);

  const handleUndo = () => {
    if (!isActive || !editorRef.current) return;
    
   
    history.undo(editorRef);
    
   
    if (onContentChange) {
      onContentChange();
    }
  };

  return (
    <button
      className={`formatting-button ${isActive ? 'active' : 'disabled'}`}
      onClick={handleUndo}
      title="Undo"
      disabled={!isActive}
      aria-label="Undo"
    >
      <UndoIcon width={22} height={24} className='button-to-center'/>
      
    </button>
  );
};

export default Undo;