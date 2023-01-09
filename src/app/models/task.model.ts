import { GralDoc } from "./doc.model";

export interface TaskCreation {
  name: string,
}

export interface TaskUpdate {
  name?: string,
}

export interface Task extends TaskCreation, GralDoc { }
