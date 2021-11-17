import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import { io } from 'socket.io-client';

declare global {
  namespace NodeJS {
    interface Global {
        BE_HOST: string
        socket: any
    }
  }
}

global.BE_HOST = window.location.origin;
global.socket = io(`${global.BE_HOST}/global`);

const element =
  <React.StrictMode>
    <App />
  </React.StrictMode>;

ReactDOM.render(element, document.getElementById('root'));