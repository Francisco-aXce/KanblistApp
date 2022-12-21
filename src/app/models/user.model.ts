import { ParsedToken } from "@angular/fire/auth";

export interface UserData {
  claims: ParsedToken,
};

// user form types: 'login' | 'signup'
export type UserForm = 'login' | 'signup';
