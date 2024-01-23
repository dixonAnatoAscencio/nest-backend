import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";


@Entity({name: 'product_images'})
export class ProductImage{
    @PrimaryGeneratedColumn()
    id: number

    @Column('text')
    url: string

    @ManyToOne(
        () => Product,
        (product) => product.images,
        {onDelete: 'CASCADE'} //cuando el producto se elimina se elimina la imagen
    )
    product: Product
}