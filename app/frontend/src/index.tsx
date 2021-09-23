import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'

declare global {
  namespace NodeJS {
    interface Global {
        BE_HOST: string
    }
  }
}

global.BE_HOST = "http://127.0.0.1:3001";

const element =
  <React.StrictMode>
    <App />
  </React.StrictMode>;

ReactDOM.render(element, document.getElementById('root'));