import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from 'src/redis/cache.service';
import { cacheKeys } from 'src/redis/redis.keys';
import {
  CreateProject,
  Project,
} from 'src/configs/interfaces/project.interface';
import { CustomError } from 'src/common/exceptions/customError';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  //CREATE PROJECT
  async createProject(
    data: CreateProject,
    user: string,
  ): Promise<Record<any, string>> {
    const {
      name,
      description,
      type,
      githubUrl,
      deadline,
      startDate,
      privacy,
      color,
      creatorId,
      status,
      members,
      tasks,
    } = data;
    let createorId = data.creatorId;
    createorId = user;

    // Check if the project already exists in the cache
    let cacheKey = `${cacheKeys.PROJECT}:${name}`;
    const cachedProject = await this.cacheService.get(cacheKey);
    if (cachedProject) {
      throw new CustomError('Project already exists', 409);
    }
    // Check if the project already exists in the database
    const existingProject = await this.prisma.project.findUnique({
      where: { name },
    });
    if (existingProject) {
      throw new CustomError('Project already exists', 409);
    }

    const project = await this.prisma.project.create({
      data: {
        name,
        description,
        type,
        githubUrl,
        deadline,
        startDate,
        privacy,
        color,
        creatorId: createorId,
        status,
        members: {
          connect: members?.map((member) => ({ id: member })),
        },
        tasks: {
          connect: tasks?.map((task) => ({ id: task })),
        },
      },
    });

    console.log(project);
    cacheKey = `${cacheKeys.PROJECT}:${project.id}`;
    const cacheTTL = 60 * 280;
    await this.cacheService.set(cacheKey, project, cacheTTL);

    const response: Record<any, string> = {
      message: 'Project created successfully',
      projectID: project.id,
    };

    return response;
  }

  //GET PROJECT BY ID
  async getProjectById(id: string): Promise<any> {
    const cacheKey = `${cacheKeys.PROJECT}:${id}`;
    const cachedProject = await this.cacheService.get(cacheKey);

    if (cachedProject) {
      console.log('Gotten From Cache!');
      return cachedProject as Project;
    }

    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new CustomError('Project not found', 404);
    }

    const cacheTTL = 60 * 280;
    await this.cacheService.set(cacheKey, project, cacheTTL);

    return project;
  }

  //GET PROJECT BY NAME
  async getProjectByName(name: string): Promise<any> {
    const cacheKey = `${cacheKeys.PROJECT}:${name}`;
    const cachedProject = await this.cacheService.get(cacheKey);

    if (cachedProject) {
      return cachedProject as Project;
    }

    const project = await this.prisma.project.findUnique({
      where: { name },
    });

    if (!project) {
      throw new CustomError('Project not found', 404);
    }

    const cacheTTL = 60 * 280;
    await this.cacheService.set(cacheKey, project, cacheTTL);

    return project;
  }
}
