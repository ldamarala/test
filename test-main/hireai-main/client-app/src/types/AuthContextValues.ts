import { Dispatch, SetStateAction } from 'react';

export type AuthContextValues = {
  auth: Auth | null;
  setAuth: Dispatch<SetStateAction<Auth | null>>;
};

export interface Auth {
  username: string;
  id: string;
  isLoggedIn: boolean;
  roles?: string[];
  accessToken?: string;
}
