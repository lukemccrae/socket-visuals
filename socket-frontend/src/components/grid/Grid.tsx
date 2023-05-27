import React, { useEffect, useState } from 'react';
import './grid.css'; 

export const Grid: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [buttonStates, setButtonStates] = useState<boolean[]>(Array(64).fill(true));

  useEffect(() => {
    // Create new WebSocket connection when component mounts
    const newSocket = new WebSocket("wss://blooming-shore-86317.herokuapp.com:443");
    console.log(newSocket, '<< newSocket')

    newSocket.onopen = () => {
      // console.log("WebSocket connection opened!");
      if(socket === null) { // Check if socket state is undefined
        setSocket(newSocket);
      }
      console.log(socket, '<< socket')
    };

    newSocket.onclose = () => {
      console.log("WebSocket connection closed!");
      setSocket(null);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error: " + error);
    };

    // Clean up WebSocket connection when component unmounts
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [socket]); // Only run this effect when the socket state changes

  const handleButtonClick = (index: number) => {
    const updatedButtonStates = [...buttonStates];
    updatedButtonStates[index] = !updatedButtonStates[index];
    setButtonStates(updatedButtonStates);

    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('im here')
    // Send a string message to the WebSocket server
    socket.send(`you clicked button ${index}`);
  } else {
    console.error("WebSocket is not connected.");
  }
  };

  return (
    <div className="push2-grid-container">
        <div className="push2-grid">
        {buttonStates.map((state, index) => (
          <button
          key={index}
          className={`push2-button ${state ? 'on' : 'off'}`}
          onClick={() => handleButtonClick(index)}
          ></button>
        ))}
        </div>
    </div>
  );
};

export default Grid;