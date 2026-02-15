import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../entities/User/user.entity";
import { Client } from "../../entities/Client/client.entity";
import { UserRole, UserStatus } from "../../entities/User/user.entity";

const SEED_CLIENT_EMAIL = "client@example.com";
const SEED_CLIENT_PASSWORD = "ClientPassword1!";

export async function seedClient(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const clientRepo = dataSource.getRepository(Client);

  let user = await userRepo.findOne({ where: { email: SEED_CLIENT_EMAIL } });
  if (!user) {
    user = userRepo.create({
      name: "Тестовый клиент",
      email: SEED_CLIENT_EMAIL,
      password: await bcrypt.hash(SEED_CLIENT_PASSWORD, 10),
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    });
    await userRepo.save(user);
  }

  const existingClient = await clientRepo.findOne({ where: { userId: user.id } });
  if (!existingClient) {
    const client = clientRepo.create({
      userId: user.id,
      full_name: "Тестовый клиент",
      city: "Москва",
      contacts: [],
      notification_settings: { sms: false, email: false },
      privacy_settings: { phone: false, email: false, social_links: false },
    });
    await clientRepo.save(client);
  }
}
