import React from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container);

function WelcomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f6f6f7'
    }}>
      <img 
        src="https://res.cloudinary.com/djjovgwyk/image/upload/v1739515599/photo_2025-02-14_08-37-33_fyib4y.png"
        alt="The Pet India Logo"
        style={{
          width: '200px',
          marginBottom: '2rem'
        }}
      />
      <h1 style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '2rem',
        color: '#202223'
      }}>
        Welcome to The Pet India
      </h1>
    </div>
  );
}

// Render the component to the root div
// ReactDOM.render(
//   <React.StrictMode>
//     <WelcomePage />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

root.render(
    <React.StrictMode>
      <WelcomePage />
    </React.StrictMode>
  );

export default WelcomePage;
