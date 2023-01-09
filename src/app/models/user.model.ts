import { ParsedToken } from "@angular/fire/auth";

export interface UserData {
  claims: ParsedToken,
};

export interface UserBasicInfo {
  id: string,
  name?: string,
  surname?: string,
  email?: string,
  photo?: string,
}

// user form types: 'login' | 'signup'
export type UserForm = 'login' | 'signup';
