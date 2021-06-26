import { IsString } from 'class-validator';

export class LoginCodeDto {
    @IsString()
    readonly code: string;
}
