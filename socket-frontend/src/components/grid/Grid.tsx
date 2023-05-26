import React, { useState } from 'react';
import './grid.css'; 

export const Grid: React.FC = () => {
  const [buttonStates, setButtonStates] = useState<boolean[]>(Array(64).fill(true));

  const handleButtonClick = (index: number) => {
    console.log(index, '<< index')
    const updatedButtonStates = [...buttonStates];
    updatedButtonStates[index] = !updatedButtonStates[index];
    setButtonStates(updatedButtonStates);
  };

  return (
    <div className="push2-grid-container">
        <div className="push2-grid">
        {buttonStates.map((state, index) => (
            <button
            key={index}
            className={`push2-button ${state ? 'on' : 'off'}`}
            onClick={() => handleButtonClick(index)}
            />
        ))}
        </div>
    </div>
  );
};

export default Grid;