import { useState, useCallback } from 'react';
import { usersAPI } from '../../services/api';
import Avatar from '../common/Avatar';
import useChatStore from '../../store/chatStore';

const SearchPanel = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { startConversation } = useChatStore();

  const handleSearch = useCallback(async (value) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await usersAPI.search(value);
      setResults(res.data.users);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleStartChat = async (userId) => {
    await startConversation(userId);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 text-sm outline-none placeholder-gray-400"
        />
        {query && (
          <button onClick={() => handleSearch('')} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isSearching && query.length >= 2 && results.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">No users found</p>
        )}

        {results.map((user) => (
          <button
            key={user._id}
            onClick={() => handleStartChat(user._id)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
          >
            <Avatar user={user} size="md" showOnline />
            <div>
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </button>
        ))}

        {query.length < 2 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;
