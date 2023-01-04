import { GralDoc } from "./docs.model";
import { UserBasicInfo } from "./user.model";

export interface ProjectCreation {
  name: string,
  image: string,
  description: string,
  active?: boolean,
};

export interface Project extends ProjectCreation, GralDoc {
  owner: UserBasicInfo,
};

export interface Goal extends Omit<Project, 'image' | 'owner'> {
  order: number,
  color?: string,
  attendant: UserBasicInfo,
};
