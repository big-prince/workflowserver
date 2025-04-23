import { IsString, IsNotEmpty, IsDate, IsBoolean } from 'class-validator';
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

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDate()
  @IsNotEmpty()
  deadline: Date;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsNotEmpty()
  privacy: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString({ each: true })
  techStack: string[];

  @IsBoolean()
  @IsNotEmpty()
  pinned: boolean;
}
