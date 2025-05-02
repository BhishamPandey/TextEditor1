import React from 'react';

interface IconProps {
  fill?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ 
  fill = "#222f3e", 
  width = "100%", 
  height = "100%", 
  className = "" 
}) => {
  return (
    <svg 
      viewBox="0 0 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M3.8,14.4h12.3v2.3H3.8V14.4z"></path>
      <path d="M15.8,8.1c0-0.1,0-0.2-0.1-0.3L11,3.1c0,0-0.1,0-0.1-0.1V2H9.9v1.5L4.1,8.2C3.9,8.3,3.8,8.6,4,8.8l4.6,4.6c0.1,0.1,0.2,0.2,0.4,0.2h0c0.1,0,0.3,0,0.4-0.1l5.3-4.3v2c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5V8.1C15.8,8.1,15.8,8.1,15.8,8.1z M9.1,12.4L5.2,8.5l4.6-3.8v2.1h1.1V4.5L14.5,8L9.1,12.4z"></path>
    </svg>
  );
};

export const AlignLeftIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%", 
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M2 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
};


export const AlignCenterIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%", 
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M4 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm2-3a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-2-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
};

export const AlignRightIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%", 
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M6 12.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm-4-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0-3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
};

export const IncreaseIndentIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M2 3.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm.646 2.146a.5.5 0 01.708 0l2 2a.5.5 0 010 .708l-2 2a.5.5 0 01-.708-.708L4.293 8 2.646 6.354a.5.5 0 010-.708zM7 6.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm-5 3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
};

export const DecreaseIndentIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M2 3.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm10.646 2.146a.5.5 0 01.708.708L11.707 8l1.647 1.646a.5.5 0 01-.708.708l-2-2a.5.5 0 010-.708l2-2zM2 6.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" />
    </svg>
  );
};

export const OrderedListIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path 
        fillRule="evenodd" 
        d="M5 11.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5z" 
        clipRule="evenodd"
      />
      <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 01-.492.594v.033a.615.615 0 01.569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 00-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z" />
    </svg>
  );
};

export const UnorderedListIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="-2 -2 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path 
        fillRule="evenodd" 
        d="M5 11.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm-3 1a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2z" 
        clipRule="evenodd"
      />
    </svg>
  );
};

export const TextColourIcon: React.FC<IconProps> = ({ 
  fill = "#222f3e", 
  width = "100%", 
  height = "100%", 
  className = "" 
}) => {
  return (
    <svg 
      viewBox="0 0 20 20" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M13.6,12.6h1.2l-4.3-9.8H9.3L5,12.6h1.2l1-2.3h5.4L13.6,12.6z M7.8,9.2l2.1-4.8H10l2.1,4.8L7.8,9.2z M3.8,14.4h12.3v2.3H3.8V14.4z" />
    </svg>
  );
};

export const EmojiIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="-2 -2 20 20"
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <circle fill="none" cx="8" cy="8" r="6" />
      <path fill={fill} d="M8,1C4.1,1,1,4.1,1,8s3.1,7,7,7s7-3.1,7-7C15,4.1,11.9,1,8,1z M8,14c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6C14,11.3,11.3,14,8,14z M11,9.8l0.9,0.5c-1.2,2.2-4,2.9-6.1,1.6c-0.7-0.4-1.3-1-1.6-1.6L5,9.8c1,1.7,3.1,2.2,4.8,1.3C10.3,10.7,10.7,10.3,11,9.8z M4.5,6.5c0-0.6,0.4-1,1-1s1,0.4,1,1s-0.4,1-1,1S4.5,7.1,4.5,6.5z M9.5,6.5c0-0.6,0.4-1,1-1s1,0.4,1,1s-0.4,1-1,1S9.5,7.1,9.5,6.5z" />
    </svg>
  );
};

export const BoldIcon: React.FC<IconProps> = ({
  fill = "#5F6368",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z" />
    </svg>
  );
};

export const ItalicIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />
    </svg>
  );
};

export const UnderlineIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z" />
    </svg>
  );
};



export const UndoIcon: React.FC<IconProps> = ({
  fill = "#5F6368",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M6.4 8H12c3.7 0 6.2 2 6.8 5.1.6 2.7-.4 5.6-2.3 6.8a1 1 0 0 1-1-1.8c1.1-.6 1.8-2.7 1.4-4.6-.5-2.1-2.1-3.5-4.9-3.5H6.4l3.3 3.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 1.4L6.4 8Z" fillRule="nonzero" />
    </svg>
  );
};

export const RedoIcon: React.FC<IconProps> = ({
  fill = "#5F6368",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M17.6 10H12c-2.8 0-4.4 1.4-4.9 3.5-.4 2 .3 4 1.4 4.6a1 1 0 1 1-1 1.8c-2-1.2-2.9-4.1-2.3-6.8.6-3 3-5.1 6.8-5.1h5.6l-3.3-3.3a1 1 0 1 1 1.4-1.4l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4l3.3-3.3Z" fillRule="nonzero" />
    </svg>
  );
};

export const AttachFileIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg
      viewBox="-2 -2 36 36"
      fill={fill}
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M25.7,9.3l-7-7A.91.91,0,0,0,18,2H8A2,2,0,0,0,6,4V28a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V10A.91.91,0,0,0,25.7,9.3ZM18,4.4,23.6,10H18ZM24,28H8V4h8v6a2,2,0,0,0,2,2h6Z"></path>
      <polygon points="21 19 17 19 17 15 15 15 15 19 11 19 11 21 15 21 15 25 17 25 17 21 21 21 21 19"></polygon>
    </svg>
  );
};

export const LinkIcon: React.FC<IconProps> = ({
  fill="#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M6.2 12.3a1 1 0 0 1 1.4 1.4l-2 2a2 2 0 1 0 2.6 2.8l4.8-4.8a1 1 0 0 0 0-1.4 1 1 0 1 1 1.4-1.3 2.9 2.9 0 0 1 0 4L9.6 20a3.9 3.9 0 0 1-5.5-5.5l2-2Zm11.6-.6a1 1 0 0 1-1.4-1.4l2-2a2 2 0 1 0-2.6-2.8L11 10.3a1 1 0 0 0 0 1.4A1 1 0 1 1 9.6 13a2.9 2.9 0 0 1 0-4L14.4 4a3.9 3.9 0 0 1 5.5 5.5l-2 2Z" fillRule="nonzero" />
    </svg>
  );
};


export const FormatTextIcon: React.FC<IconProps> = ({
  fill = "#222f3e",
  width = "100%",
  height = "100%",
  className = ""
}) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill={fill} 
      style={{ width, height, margin: 0, border: 0, alignSelf: 'self-start' }}
      className={className}
    >
      <path d="M13.2 6a1 1 0 0 1 0 .2l-2.6 10a1 1 0 0 1-1 .8h-.2a.8.8 0 0 1-.8-1l2.6-10H8a1 1 0 1 1 0-2h9a1 1 0 0 1 0 2h-3.8ZM5 18h7a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Zm13 1.5L16.5 18 15 19.5a.7.7 0 0 1-1-1l1.5-1.5-1.5-1.5a.7.7 0 0 1 1-1l1.5 1.5 1.5-1.5a.7.7 0 0 1 1 1L17.5 17l1.5 1.5a.7.7 0 0 1-1 1Z" fillRule="evenodd" />
    </svg>
  );
};





export default Icon;