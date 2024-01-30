import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express'; //carga de archivos especifica para express no sirve para fastify
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ){

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits: { fileSize: 1000000 },
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer

    })
  //Intercepta la propiedad del body para cargar el archivo
  })) 

  uploadProductImage(@UploadedFile() file: Express.Multer.File){
   
   
    if(!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${ this.configService.get('HOST_API') }files/product/${ file.filename }`;
   
    return {
      secureUrl
    }
  }

}
