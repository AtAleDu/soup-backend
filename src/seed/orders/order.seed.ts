import { DataSource } from "typeorm";
import { Client } from "../../entities/Client/client.entity";
import { Order } from "../../entities/Order/order.entity";
import { OrderStatus } from "../../entities/Order/order.entity";

const ORDER_DATA = [
  {
    title: "Ремонт кухни",
    description: "Замена столешницы и фартука",
    region: "Москва",
    price: 50000,
    category: "Ремонт",
    status: OrderStatus.ACTIVE,
    deadline: null as Date | null,
    hidePhone: false,
    fileUrls: [] as string[],
  },
  {
    title: "Установка кондиционера",
    description: "Монтаж в двухкомнатной квартире",
    region: "Москва",
    price: 25000,
    category: "Климатическая техника",
    status: OrderStatus.ACTIVE,
    deadline: null as Date | null,
    hidePhone: true,
    fileUrls: [] as string[],
  },
];

export async function seedOrders(dataSource: DataSource) {
  const clientRepo = dataSource.getRepository(Client);
  const orderRepo = dataSource.getRepository(Order);

  const client = await clientRepo.findOne({ where: {}, order: { clientId: "ASC" } });
  if (!client) {
    console.warn("Order seed skipped: no client found. Run client seed first.");
    return;
  }

  const count = await orderRepo.count();
  if (count > 0) return;

  const orders = ORDER_DATA.map((item) =>
    orderRepo.create({
      clientId: client.clientId,
      title: item.title,
      description: item.description,
      region: item.region,
      price: item.price,
      category: item.category,
      status: item.status,
      deadline: item.deadline,
      hidePhone: item.hidePhone,
      fileUrls: item.fileUrls,
    }),
  );
  await orderRepo.save(orders);
}
