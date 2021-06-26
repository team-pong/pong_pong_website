import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'

const element = <React.StrictMode>
                  <App/>
                </React.StrictMode>;

ReactDOM.render(element, document.getElementById('root'));