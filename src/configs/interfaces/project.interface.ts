export interface CreateProject {
  name: string;
  description: string | null;
  creatorId: string;
  members?: string[];
  tasks?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  status: string;
  members?: string[];
  tasks?: string[];
  createdAt: Date;
  updatedAt: Date;
}
