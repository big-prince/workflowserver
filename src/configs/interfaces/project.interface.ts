export interface CreateProject {
  name: string;
  description: string | null;
  type: string;
  githubUrl: string | null;
  deadline: Date | null;
  startDate: Date | null;
  privacy: string;
  color: string;
  creatorId: string;
  status: string;
  members?: string[];
  tasks?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  githubUrl: string | null;
  deadline: Date | null;
  startDate: Date | null;
  privacy: string;
  color: string;
  creatorId: string;
  status: string;
  members?: string[];
  tasks?: string[];
  createdAt: Date;
  updatedAt: Date;
}
