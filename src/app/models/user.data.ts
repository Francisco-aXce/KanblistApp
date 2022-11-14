import { User } from "@angular/fire/auth";

export interface UserData {
  user: User,
};

// user form types: 'login' | 'signup'
export type UserForm = 'login' | 'signup';
