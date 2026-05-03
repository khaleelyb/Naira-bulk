
import React, { useState } from 'react';
import { UserCogIcon } from './icons/UserCogIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate network delay for better UX
    setTimeout(() => {
        const success = onLogin(username, password);
        if (!success) {
            setError('Invalid username or password.');
            setIsLoading(false);
        }
        // On success, the parent component will change the view, so we don't need to setIsLoading(false)
    }, 500);
  };

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <UserCogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Admin Login</h2>
        <p className="mt-2 text-sm text-gray-600">Please enter your credentials to access the admin panel.</p>

        {error && (
            <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded text-left" role="alert">
                <p>{error}</p>
            </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              required 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
              onChange={(e) => setUsername(e.target.value)} 
              value={username}
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              required 
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" 
              onChange={(e) => setPassword(e.target.value)} 
              value={password}
              autoComplete="current-password"
            />
          </div>
          <div>
            <button 
              type="submit" 
              disabled={isLoading} 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Logging in...</> : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
