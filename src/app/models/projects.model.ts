import { GralDoc } from "./docs.model";

export interface ProjectCreation {
  name: string,
  image: string,
  active?: boolean,
};

export interface Project extends ProjectCreation, GralDoc { };

