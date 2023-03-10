import {
    IsString,
    MinLength,
    IsEmail,
    IsNotEmpty
} from 'class-validator';

export class CreateUserDto {

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
