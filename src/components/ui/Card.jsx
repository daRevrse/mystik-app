import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <div className={`
      glass-card overflow-hidden transition-all duration-300 
      ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
