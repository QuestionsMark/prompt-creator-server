import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FileItem extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'varchar',
        length: 500,
        unique: true,
    })
    filename: string;
}