import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { CreateProject } from 'src/configs/interfaces/project.interface';

type CreateProjectType = Required<
  Pick<CreateProject, 'name' | 'description' | 'creatorId'>
>;

export class CreateProjectDto implements CreateProjectType {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  creatorId: string;

  @IsString()
  githubUrl: string | null;

  @IsString({ each: true })
  members?: string[];

  @IsString({ each: true })
  tasks?: string[];

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDate()
  @IsNotEmpty()
  deadline: Date | null;

  @IsDate()
  @IsNotEmpty()
  startDate: Date | null;

  @IsString()
  @IsNotEmpty()
  privacy: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}
