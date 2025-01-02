import React from 'react';
import Spinner from '../common/Spinner';

const GameLoading: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center space-y-8 pt-20">
      <h1 className="text-3xl text-white">Loading Game...</h1>
      <Spinner className="h-8 w-8 text-white" />
    </div>
  );
};

export default GameLoading;