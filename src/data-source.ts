import { DataSource } from "typeorm";
import { User } from "./modules/users/entities/user.entity";

export default new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || "localhost",
  port: +(process.env.POSTGRES_PORT || 5432),
  username: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "123456",
  database: process.env.POSTGRES_DB || "Database-nestjs",
  entities: [User],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
});
