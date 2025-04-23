/* eslint-disable @typescript-eslint/no-unused-vars */
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
      status,
      members,
      techStack,
      pinned,
    } = data;
    data.creatorId = user;
    const createorId = user;

    // Check if the project already exists in the cache
    let cacheKey = `${cacheKeys.PROJECT}:${name}`;

    const getUserIdsByEmails = async (emails: string[]) => {
      const users = await this.prisma.user.findMany({
        where: { email: { in: emails } },
        select: { id: true },
      });

      if (users.length !== emails.length) {
        throw new CustomError('Some members not found', 400);
      }

      return users.map((user) => ({ id: user.id }));
    };

    let connectMembers: { id: string }[] = [];

    if (Array.isArray(members) && members.length) {
      connectMembers = await getUserIdsByEmails(members);
    }

    // Check if the project already exists in the database
    const existingProject = await this.prisma.project.findUnique({
      where: { name },
    });
    if (existingProject) {
      console.log('🚀 ~ ProjectService ~ existingProject:', existingProject);
      throw new CustomError('Project already exists', 409);
    }

    const isodateConverter = (data: Date): string | null => {
      const date = new Date(data);
      return date.toISOString();
    };

    const foundMembers = await this.prisma.user.findMany({
      where: {
        id: { in: members || [] },
      },
    });
    if (foundMembers.length !== (members?.length || 0)) {
      throw new CustomError('One or more members not found', 400);
    }

    console.log(pinned, 'pinned');
    const project = await this.prisma.project
      .create({
        data: {
          name,
          description,
          type,
          githubUrl,
          deadline: isodateConverter(deadline),
          startDate: isodateConverter(startDate),
          privacy,
          color,
          creatorId: createorId,
          status,
          techStack,
          pinned,
          members: {
            connect: connectMembers,
          },
        },
      })
      .catch((e) => {
        console.log('🚀 ~ ProjectService ~ createProject ~ e:', e);
        throw new CustomError('Error creating project', 500);
      });

    if (!project) {
      throw new CustomError('Project not created', 500);
    }

    //append project to user
    await this.prisma.user.update({
      where: { id: createorId },
      data: {
        projects: {
          connect: { id: project.id },
        },
      },
    });
    //append project to members
    if (Array.isArray(members) && members.length) {
      for (const memberId of connectMembers.map((member) => member.id)) {
        await this.prisma.user.update({
          where: { id: memberId },
          data: {
            projects: {
              connect: { id: project.id },
            },
          },
        });
      }
    }

    console.log(project);
    cacheKey = `${cacheKeys.PROJECT}:${project.id}`;
    const cacheTTL = 60 * 280;
    //clear cache for the user projects
    const userCacheKey = `${cacheKeys.PROJECT}:${createorId}`;
    await this.cacheService.del(userCacheKey);
    //set cache for the project
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

  //get users projets
  async getUserProjects(id: string): Promise<any> {
    const cacheKey = `${cacheKeys.PROJECT}:${id}`;
    const cachedProjects = await this.cacheService.get(cacheKey);

    if (cachedProjects) {
      console.log('Gotten From Cache!');
      return cachedProjects as Project[];
    }

    const projects = await this.prisma.project.findMany({
      where: { creatorId: id },
    });
    console.log(projects.length);

    if (!projects) {
      throw new CustomError('Projects not found', 404);
    }

    const cacheTTL = 60 * 280;
    await this.cacheService.set(cacheKey, projects, cacheTTL);

    return projects;
  }
}
