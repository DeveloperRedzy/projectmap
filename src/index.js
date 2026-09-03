import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import {Provider} from "react-redux";
import {store} from './redux/store';
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from './queries/queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
      <Provider store={store}>
          <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                  <App/>
              </BrowserRouter>
          </QueryClientProvider>
      </Provider>
  </React.StrictMode>
);


