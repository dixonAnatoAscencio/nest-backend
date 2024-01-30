import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {
   
    @ApiProperty({
        required: false,
        type: Number,
        minimum: 0,
    })
    @IsOptional()
    @IsPositive()
    //Transformar
    @Type(() => Number) //enableImplicitConversions = true 
    limit?: number;
   
   
    @ApiProperty({
        default: 0,
        description: 'How many items should be skipped',
        
    })
    @IsOptional()
    @Type(() => Number) //enableImplicitConversions = true 
    @Min(0)
    offset?: number;
}