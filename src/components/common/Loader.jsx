import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-green-600" size={48} />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default Loader;