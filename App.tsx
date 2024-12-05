import React from 'react';
import { Provider } from 'react-redux';
import { store } from './TaskReduxStore';
import { SmartCalendarApp } from './SmartCalendar';

// Optional: Global styles and Tailwind CSS import
import './index.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Smart Calendar</h1>
        </header>
        <main className="container mx-auto p-4">
          <SmartCalendarApp />
        </main>
      </div>
    </Provider>
  );
};

export default App;
