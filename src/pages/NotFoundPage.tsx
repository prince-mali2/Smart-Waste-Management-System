import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <div className="text-emerald-600 mb-6">
        <Trash2 className="h-24 w-24 mx-auto" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 max-w-md mb-8">
        Oops! It seems like the page you're looking for has been recycled or never existed in the first place.
      </p>
      <Link to="/">
        <Button size="lg" className="gap-2">
          <Home className="h-5 w-5" /> Back to Home
        </Button>
      </Link>
    </div>
  );
};
