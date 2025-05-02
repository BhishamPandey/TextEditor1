import React, { useRef } from 'react';
import './AttachFile.scss';
import { AttachFileIcon } from '../Icons/Icons';

interface AttachFileProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  lastSelection: Range | null;
  saveSelection?: () => void;
  restoreSelection?: () => void;
  onContentChange?: () => void;
}

const AttachFile: React.FC<AttachFileProps> = ({ 
  editorRef, 
//   lastSelection,
  saveSelection,
  restoreSelection,
  onContentChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
   
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
      
     
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (file: File) => {
   
    if (editorRef.current) {
      editorRef.current.focus();      
     
      if (restoreSelection) {
        restoreSelection();
      }     
     
      insertFileAtCursor(file);
    }
  };
  
  const insertFileAtCursor = (file: File) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const fileElement = createFileElement(file);   
    
    const spaceNode = document.createTextNode('\u00A0');    
   
    range.deleteContents();
    range.insertNode(fileElement);
    range.insertNode(spaceNode);
      
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    selection.removeAllRanges();
    selection.addRange(range);
        
    if (onContentChange) {
      onContentChange();
    }    
    
    if (saveSelection) {
      saveSelection();
    }
  };

  const createFileElement = (file: File) => {
    const fileType = file.type.split('/')[0]; 
    const fileElement = document.createElement('span');
    fileElement.className = 'attached-file';
    fileElement.setAttribute('data-filename', file.name);
    fileElement.setAttribute('data-filetype', file.type);
    fileElement.setAttribute('contenteditable', 'false');
    
    const fileSize = formatFileSize(file.size);
    
    
    let icon = '📄';
    if (fileType === 'image') icon = '🖼️';
    else if (fileType === 'video') icon = '🎬';
    else if (fileType === 'audio') icon = '🎵';
    else if (file.name.endsWith('.pdf')) icon = '📕';
    
    fileElement.innerHTML = `
      <span class="file-icon">${icon}</span>
      <div class="file-details">
        <span class="file-name">${file.name}</span>
        <span class="file-size">${fileSize}</span>
      </div>
    `;
    
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.className = 'file-preview';
          img.style.maxWidth = '100%';
          img.style.maxHeight = '200px';        

          const iconElement = fileElement.querySelector('.file-icon');
          if (iconElement) {
            iconElement.replaceWith(img);
          }         
          if (onContentChange) {
            onContentChange();
          }
        }
      };
      reader.readAsDataURL(file);
    }    
    return fileElement;
  };
  
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="attach-file">
      <button 
        className="attach-button" 
        onClick={handleButtonClick}
        title="Attach File"
      >
      <AttachFileIcon width={24} height={26} />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AttachFile;