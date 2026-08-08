import { IsIn } from 'class-validator';

export class UpdateLeadStatusDto {
  @IsIn(['new', 'read', 'replied'])
  status!: 'new' | 'read' | 'replied';
}
