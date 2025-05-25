import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserRole1748108181607 implements MigrationInterface {
    name = 'AddUserRole1748108181607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    }

}
