import { BadGatewayException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()//custom guard
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get<string[]>('META_ROLES', context.getHandler());

    if (!validRoles) {
        return true
    }

    if (validRoles.length === 0) {
        return true
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) 
        throw new BadGatewayException('User not found');
    

    for (const role of user.roles) {
        if (validRoles.includes(role)) {
            return true
        }
    }

    throw new ForbiddenException(`User ${user.fullName} need a valid role: [${validRoles}]`)
  }
}
