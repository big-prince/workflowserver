/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, Post, UseGuards, Body, Req } from '@nestjs/common';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from 'src/common/guards/auth-guard';
import { AuthUserGuard } from 'src/common/guards/auth-user.guard';
import { Request } from 'express';
import { CreateProjectDto } from './dto/project.dto';
import { CustomError } from 'src/common/exceptions/customError';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  //CREATE PROJECT
  @UseGuards(JwtAuthGuard, AuthUserGuard)
  @Post('create-project')
  async createProject(
    @Req() req: Request,
    @Body() body: CreateProjectDto,
  ): Promise<Record<string, any>> {
    const userID: string = req['user'].id;

    const result = await this.projectService
      .createProject(body, userID)
      .catch((e) => {
        if (e instanceof CustomError) {
          throw e;
        }
        throw new CustomError(`${e}`, 500);
      });

    return result;
  }

  //GET PROJECT BY ID
  @UseGuards(JwtAuthGuard, AuthUserGuard)
  @Get('get-project/:id')
  async getProjectById(@Req() req: Request): Promise<Record<string, any>> {
    const { id } = req.params;
    const result = await this.projectService.getProjectById(id).catch((e) => {
      if (e instanceof CustomError) {
        throw e;
      }
      throw new CustomError(`${e}`, 500);
    });

    return result;
  }
}
