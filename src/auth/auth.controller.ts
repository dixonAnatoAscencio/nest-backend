import { Controller, Post, Body, Get, UseGuards, Req, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto";
import { AuthGuard } from "@nestjs/passport";
import { Auth, GetUser, RawHeaders } from "./decorators";
import { User } from "./entities/user.entity";
import { RoleProtected } from "./decorators/role-protected.decorator";
import { ValidRoles } from "./interfaces";
import { UserRoleGuard } from "./guards/user-role.guard";
import { IncomingHttpHeaders } from "http";
import { ApiTags } from "@nestjs/swagger";




@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.create(createUserDto);
    }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
        
    }

    @Get('check-status')
    @Auth()
    checkAuthStatus(
        @GetUser() user: User,   
    ){
        return this.authService.checkAuthStatus( user );
    }

    @Get('private')
    @UseGuards( AuthGuard())
    testingPrivateRoute(
        @Req() request: Express.Request,
        @GetUser() user: User,
        @GetUser('email') userEmail: string,

        @RawHeaders() rawHeaders: string[],
        @Headers() headers: IncomingHttpHeaders
    ){
        return {
            ok: true,
            message: 'private route',
            user,
            rawHeaders,
            headers
        }
    }

    @Get('private2')
    @RoleProtected( ValidRoles.admin, ValidRoles.superUser)
    @UseGuards( AuthGuard(), UserRoleGuard)
    privateRoute2(
        @GetUser() user: User
    ){
        return {
            ok: true,
            user
        }
    }


    @Get('private3')
    @Auth( ValidRoles.admin, ValidRoles.superUser)//tiene que ser uno de esos roles para acceder a la ruta
    privateRoute3(
        @GetUser() user: User
    ){
        return {
            ok: true,
            user
        }
    }


}