import {
    IsString,
    MinLength,
    IsEmail,
    IsNotEmpty
} from 'class-validator';

export class RegisterDto {

    @IsString()
    @MinLength(3)
    username?: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}
