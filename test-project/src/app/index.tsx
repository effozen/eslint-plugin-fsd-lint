import React from 'react';
import ReactDOM from 'react-dom/client';
import { withRedux } from './providers/with-redux';
import { LoginPage } from '@pages/login';

const App = () => {
  return (
    <div>
      <LoginPage />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(<React.StrictMode>{withRedux(App)()}</React.StrictMode>);
