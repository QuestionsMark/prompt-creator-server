import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Prompt extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'text',
    })
    originalPrompt: string;

    @Column({
        type: 'text',
    })
    descriptivePrompt: string;

    @Column({
        type: 'text',
    })
    examplePrompt: string;

    @Column({
        type: 'text',
    })
    genericPrompt: string;
}