import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

//Custom decorator

export const GetUser = createParamDecorator(//los decoradores son funciones
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user)
            throw new InternalServerErrorException('User not found(request)');

        
        return (!data) ? user : user[data];
        
    }
)