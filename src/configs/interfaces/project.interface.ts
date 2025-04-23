export interface CreateProject {
  name: string;
  description: string | null;
  type: string;
  githubUrl: string | null;
  deadline: Date;
  startDate: Date;
  privacy: string;
  color: string;
  creatorId: string;
  status: string;
  pinned: boolean;
  techStack: string[];
  members?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  githubUrl: string | null;
  deadline: Date;
  startDate: Date;
  privacy: string;
  color: string;
  creatorId: string;
  status: string;
  pinned: boolean;
  techStack: string[];
  members?: string[];
  tasks?: string[];
  createdAt: Date;
  updatedAt: Date;
}
