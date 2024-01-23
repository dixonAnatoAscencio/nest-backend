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
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express'; //carga de archivos especifica para express no sirve para fastify
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
   
    return {
      fileName: file.originalname
    };
  }

}
