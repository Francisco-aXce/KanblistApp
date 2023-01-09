import { GralDoc } from "./doc.model";

export interface BoardCreation {
  name: string,
  active?: boolean,
}

export interface BoardUpdate {
  name?: string,
}

export interface Board extends BoardCreation, GralDoc {
}
