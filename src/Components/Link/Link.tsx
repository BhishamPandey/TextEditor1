import React, { useState, useRef, useEffect } from 'react';
import './Link.scss';
import { LinkIcon } from '../Icons/Icons';


interface LinkProps {
    editorRef: React.RefObject<HTMLDivElement | null>;
    saveSelection?: () => void;
    restoreSelection?: () => void;
    onContentChange?: () => void;
}

const Link: React.FC<LinkProps> = ({
    editorRef,
    saveSelection,
    restoreSelection,
    onContentChange
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [url, setUrl] = useState('https://');
    const [text, setText] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [editingLink, setEditingLink] = useState<HTMLAnchorElement | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const textInputRef = useRef<HTMLInputElement>(null);


    const checkIfLink = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;

            const element = container.nodeType === 3
                ? container.parentElement
                : container as Element;

            if (element) {

                const isNodeLink = (node: Element): boolean => {
                    if (!node) return false;

                    if (node.tagName === 'A') return true;

                    return node.parentElement ? isNodeLink(node.parentElement) : false;
                };

                return isNodeLink(element);
            }
        }
        return false;
    };


    const getSelectedLinkElement = (): HTMLAnchorElement | null => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            console.log("range me kya aata hai", range)
            const container = range.commonAncestorContainer;
            console.log("container  me kya aata hai", container)

            const element = container.nodeType === 3
                ? container.parentElement
                : container as Element;

            if (element) {

                const findAnchor = (node: Element): HTMLAnchorElement | null => {
                    if (!node) return null;
                    if (node.tagName === 'A') return node as HTMLAnchorElement;
                    return node.parentElement ? findAnchor(node.parentElement) : null;
                };

                return findAnchor(element);
            }
        }
        return null;
    };


    const getSelectedText = (): string => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            return selection.toString();
        }
        return '';
    };


    useEffect(() => {
        const handleSelectionChange = () => {
            if (!isModalOpen) {
                setIsActive(checkIfLink());
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
        };
    }, [isModalOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    useEffect(() => {
        if (isModalOpen && urlInputRef.current) {
            urlInputRef.current.focus();
        }
    }, [isModalOpen]);

    const handleLinkButtonClick = () => {
        if (!editorRef.current) return;

        editorRef.current.focus();

        if (saveSelection) {
            saveSelection();
        }

        const linkElement = getSelectedLinkElement();

        setEditingLink(linkElement);

        if (linkElement) {

            setUrl(linkElement.href);

            setText(linkElement.textContent || '');

        } else {

            const selectedText = getSelectedText();
            setText(selectedText);
            setUrl('');
        }

        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!editorRef.current) return;

        if (restoreSelection) {
            restoreSelection();
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';

        const linkText = text.trim() || url;
        linkElement.textContent = linkText;

        if (editingLink) {
            editingLink.parentNode?.replaceChild(linkElement, editingLink);
        } else {

            const range = selection.getRangeAt(0);

            if (range.collapsed) {

                range.insertNode(linkElement);
            } else {

                range.deleteContents();
                range.insertNode(linkElement);
            }
        }

        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(linkElement);
        selection.addRange(newRange);


        setIsModalOpen(false);
        setEditingLink(null);


        if (onContentChange) {
            onContentChange();
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingLink(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <>
            <button
                className={`formatting-button ${isActive ? 'active' : ''}`}
                onClick={handleLinkButtonClick}
                title="Insert/Edit Link"
                aria-label="Insert/Edit Link"
            >

                <LinkIcon className='Link-button'  width={22} height={24} />
            </button>

            {isModalOpen && (
                <div className="link-modal-overlay">
                    <div className="link-modal" ref={modalRef} onKeyDown={handleKeyDown}>
                        <div className="link-modal-header">
                            <h3>Insert/Edit Link</h3>
                            <button className="close-button" onClick={handleCancel} aria-label="Close">
                                ×
                            </button>
                        </div>

                        <div className="link-modal-body">
                            <div className="form-group">
                                <label htmlFor="link-url">URL</label>
                                <input
                                    id="link-url"
                                    ref={urlInputRef}
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="link-text">Text to Display</label>
                                <input
                                    id="link-text"
                                    ref={textInputRef}
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Link text"
                                />
                            </div>
                        </div>

                        <div className="link-modal-footer">
                            <button className="cancel-button" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button className="save-button" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Link;