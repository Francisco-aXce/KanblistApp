import { Injectable } from '@angular/core';
import { defaultImage } from 'src/assets/Projects/valid-images.project';
import { StorageService } from './storage.service';

@Injectable()
export class DataService {

  private projectsDescs: { [key: string]: string } = {};
  private goalsDescs: { [key: string]: string } = {};

  constructor(
    private storageService: StorageService,
  ) { }

  // FIXME: Repetitive code
  async getProjectDesc(owner: string, projectId: string, refresh = false) {
    if (this.projectsDescs[projectId] && !refresh) return this.projectsDescs[projectId];
    const projectDescResp = await this.storageService.getBlobText(`users/${owner}/projects/${projectId}/description.json`);
    if (!projectDescResp.success) return '';
    this.projectsDescs[projectId] = projectDescResp.text;
    return this.projectsDescs[projectId];
  }

  async getGoalDesc(owner: string, projectId: string, goalId: string, refresh = false) {
    if (this.goalsDescs[goalId] && !refresh) return this.goalsDescs[goalId];
    const goalDescResp = await this.storageService.getBlobText(`users/${owner}/projects/${projectId}/goals/${goalId}/description.json`);
    if (!goalDescResp.success) return '';
    this.goalsDescs[goalId] = goalDescResp.text;
    return this.goalsDescs[goalId];
  }

  updateLocalProjectDesc(projectId: string, desc: string) {
    this.projectsDescs[projectId] = desc;
  }

  get defaultProjImage() {
    return defaultImage;
  }

}
