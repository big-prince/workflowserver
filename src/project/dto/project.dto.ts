import { IsString, IsNotEmpty } from 'class-validator';
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
}
