import React from 'react';
import TextEditor from './Components/Editor/TextEditor';

const App: React.FC = () => {
  return (
    <div className="app">
      <TextEditor initialContent="" />
    </div>
  );
};

export default App;