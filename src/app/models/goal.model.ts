import { GralDoc } from "./doc.model";
import { UserBasicInfo } from "./user.model";

export interface GoalCreation {
  name: string,
  description: string,
  active?: boolean,
}

export interface Goal extends GoalCreation, GralDoc {
  boards: { id: string }[],
  attendant: UserBasicInfo,
};
