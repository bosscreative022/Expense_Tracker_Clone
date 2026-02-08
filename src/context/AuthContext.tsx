import { createContext } from 'react';

export const AuthContext = createContext({
  setUserToken: (token: string | null) => {},
});
