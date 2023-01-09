import { GralDoc } from "./doc.model";
import { UserBasicInfo } from "./user.model";

export interface ProjectCreation {
  name: string,
  image: string,
  description: string,
  active?: boolean,
};

export interface ProjectUpdate {
  name?: string,
  image?: string,
  description?: string,
}

export interface Project extends ProjectCreation, GralDoc {
  owner: UserBasicInfo,
};
