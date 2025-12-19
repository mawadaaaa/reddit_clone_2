'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const VoteContext = createContext();

export function VoteProvider({ children }) {
  // Map of postId -> { userVote: 'up'|'down'|null, score: number }
  const [voteState, setVoteState] = useState({});

  const getVote = (postId) => {
    return voteState[postId];
  };

  const registerVote = (postId, userVote, score) => {
    setVoteState(prev => ({
      ...prev,
      [postId]: { userVote, score }
    }));
  };

  return (
    <VoteContext.Provider value={{ getVote, registerVote }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  return useContext(VoteContext);
}
