import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {
   
    @IsOptional()
    @IsPositive()
    //Transformar
    @Type(() => Number) //enableImplicitConversions = true 
    limit?: number;
   
   
    @IsOptional()
    @Type(() => Number) //enableImplicitConversions = true 
    @Min(0)
    offset?: number;
}