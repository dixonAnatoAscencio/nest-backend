import { ExecutionContext, createParamDecorator } from "@nestjs/common";

//Custom decorator

export const RawHeaders = createParamDecorator(//los decoradores son funciones
    (data: string, ctx: ExecutionContext) => {
        
        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;

    }
)