import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); //propiedad dentro de la clase para loguear

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, //OBtiene la cadena de conexión y configuracion de la db
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
          user
        ),
      }); //se crea el objeto product

      await this.productRepository.save(product); //se guarda en la base de datos

      return { ...product, images }; //regresamos las imagenes con la estructura que se estan arriba
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    //funcion para regresar el objeto como quiero
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id, ...toUpdate }); //preload de un objeto que luzca asi y actalize los valores del dto

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); //conecta con la db para realizar la transaccion
    await queryRunner.startTransaction(); //inicia la transaccion

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } }); // elimina las imagenes antiguas del producto actual /OJO con el delete * from ProductImage/ cuidado al definir el criterio

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      } else {
        product.images = await this.productImageRepository.findBy({
          product: { id },
        });
      }

      product.user = user;
      await queryRunner.manager.save(product); // salvar el producto /Intenta grabarlo/ no se ejecuta el commit aun

      await queryRunner.commitTransaction(); //ejecuta el commit
      await queryRunner.release(); //

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction(); //si hay un error se hace un rollback de la transaccion
      await queryRunner.release(); //si hay un error se hace un rollback de la transaccion

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);

    return { deleted: true };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      //podemos agreagar todos los posbles errores y centralizarlos
      throw new Error(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProducts() {//elimina todos los productos de la base de datos solo para uso de desarrollo 
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
