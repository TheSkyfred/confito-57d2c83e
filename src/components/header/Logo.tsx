
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center font-bold text-xl md:text-2xl font-serif">
      <img src="/logo.svg" alt="Confito Logo" className="h-8 w-8 mr-2" />
      Confito
    </Link>
  );
};

export default Logo;
