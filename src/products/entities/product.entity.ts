import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "../../auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: 'c5c8c6b8-0b7e-4b5e-9c3a-6c9a9e5e4c6b',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'T-Shirt',
        description: 'Product title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number
    
    @ApiProperty({
        example: 'T-Shirt description',
        description: 'Product description',
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string
    
    @ApiProperty({
        example: 't_shirt',
        description: 'Product slug - for SEO',
    })
    @Column('text', {
        unique: true
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number

    @ApiProperty({
        example: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'men',
        description: 'Product gender',
        enum: ['men', 'women', 'kid', 'unisex']
    })
    @Column('text')
    gender: string


    //tags
    @ApiProperty({
        example: ['shirts'],
        description: 'Product tags',
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]


    //Images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }, 
    )
    images?: ProductImage[]


    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    user: User


    @BeforeInsert()
    updateSlug() {
        if(!this.slug) {
            this.slug = this.title;
        }
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        if(this.slug) {
            this.slug = this.slug
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", '')
        }
    }
    
}
