import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRoleToUser1715860738189 implements MigrationInterface {
    name = 'AddedRoleToUser1715860738189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
    }

}
