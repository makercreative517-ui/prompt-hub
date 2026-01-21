import React, { useState } from 'react';
import ApiKeySelector from './components/ApiKeySelector';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);

  if (!hasKey) {
    return <ApiKeySelector onKeySelected={() => setHasKey(true)} />;
  }

  return <MainLayout />;
};

export default App;