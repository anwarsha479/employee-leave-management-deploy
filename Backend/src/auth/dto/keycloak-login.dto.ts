import { IsString } from 'class-validator';

export class KeycloakLoginDto {
  @IsString()
  token!: string;
}
