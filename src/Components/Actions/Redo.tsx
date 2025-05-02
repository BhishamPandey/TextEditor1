import React, { useState, useEffect } from 'react';
import './Redo.scss';
import { EditorHistory } from './EditorHistory'; 
import { RedoIcon } from '../Icons/Icons';

interface RedoProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection?: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const Redo: React.FC<RedoProps> = ({
  editorRef,
  lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const [isActive, setIsActive] = useState(false);
  const history = EditorHistory.getInstance();


  useEffect(() => {
    const updateActiveState = () => {
      setIsActive(history.canRedo());
    };
    
    history.addChangeListener(updateActiveState);
     
    updateActiveState();
    
    return () => {
      history.removeChangeListener(updateActiveState);
    };
  }, []);

  const handleRedo = () => {
    if (!isActive || !editorRef.current) return;
    
    if (saveSelection) {
      saveSelection();
    }
    
    history.redo(editorRef);
    
   
    if (restoreSelection) {
      restoreSelection();
    }
    
    
    if (onContentChange) {
      onContentChange();
    }
  };

  return (
    <button
      className={`formatting-button ${isActive ? 'active' : 'disabled'}`}
      onClick={handleRedo}
      title="Redo"
      disabled={!isActive}
      aria-label="Redo"
    >
   <RedoIcon width={22} height={24} fill="#FF0000" className='button-to-center'/>
    </button>
  );
};

export default Redo;