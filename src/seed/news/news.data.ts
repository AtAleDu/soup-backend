import { NewsEntity } from "@entities/News/news.entity";

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const NEWS_DATA: Partial<NewsEntity>[] = [
  {
    image:
      "https://s3.twcstorage.ru/4b615622-soup/news/%D0%BD%D0%BE%D0%B2%D0%BE%D1%81%D1%82%D0%B8%20%D0%BB%D0%B5%D0%B2%D0%B0%D1%8F%20%D1%81%D0%B5%D0%BA%D1%86%D0%B8%D1%8F.png",
    imageAlt: "Красные башни-желуди среди осенних деревьев в парке",
    category: "Архитектура",
    title: "Название новости",
    author: "Редакция Soup",
    description:
      "Дубы — основные деревья этого парка и часть его идентичности.",
    date: daysAgo(1),
    content: [
      "Дубы — основные деревья этого парка и часть его идентичности.",
      "Авторские фонарики и малые формы создают уютную среду.",
    ],
    isImportantNew: true,
  },

  {
    image:
      "https://s3.twcstorage.ru/4b615622-soup/news/%D1%84%D1%83%D1%82%D0%B1%D0%BE%D0%BB%D0%B8%D1%81%D1%82.svg",
    imageAlt: "Пешеходная дорожка и спортивные тренажёры под эстакадой",
    category: "Пространства",
    title: "Монотонность, серость и тревожность этого пространства",
    author: "Редакция Soup",
    description:
      "Команда “Брусники” переосмысляет пространство под эстакадой.",
    date: daysAgo(2),
    content: [
      "Добавлены спорт и прогулочные маршруты.",
      "Проект сохраняет индустриальный характер.",
    ],
  },

  {
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Рекламный баннер с дизайнерской визуализацией",
    category: "Реклама",
    title: "Комплексное благоустройство под ключ",
    author: "Редакция Soup",
    description:
      "Подберём материалы, подрядчиков и готовые решения.",
    date: daysAgo(3),
    isAds: true,
  },

  {
    image:
      "https://s3.twcstorage.ru/4b615622-soup/news/%D1%84%D1%83%D1%82%D0%B1%20%D0%BF%D0%BE%D0%BB%D0%B5.svg",
    imageAlt: "Футбольное поле под мостом",
    category: "Спортивные комплексы",
    title:
      "«Бруснике» пришлось потратить очень много времени на благоустройство",
    author: "Редакция Soup",
    description:
      "Футбольное поле превратили в уютный дворик.",
    date: daysAgo(4),
    content: [
      "Безопасное покрытие и подсветка.",
      "Пространство активно используется вечером.",
    ],
  },

  {
    image:
      "https://s3.twcstorage.ru/4b615622-soup/news/%D0%BF%D0%BE%D0%BB%D0%B5.svg",
    imageAlt: "Жилые дома рядом с водой",
    category: "ЖК",
    title: "Монотонность, серость и тревожность этого пространства",
    author: "Редакция Soup",
    description:
      "Жилой квартал дополнили тропами и настилами.",
    date: daysAgo(5),
    content: [
      "Прогулки стали безопаснее.",
      "Появились общественные зоны.",
    ],
  },

  {
    image:
      "https://s3.twcstorage.ru/4b615622-soup/news/%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D0%BA%D0%B0%20%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B0%D1%8F.svg",
    imageAlt: "Двор с детской площадкой",
    category: "Архитектура",
    title:
      "«Бруснике» пришлось потратить очень много времени на благоустройство",
    author: "Редакция Soup",
    description:
      "Двор объединяет жильцов вокруг зелёного ядра.",
    date: daysAgo(6),
    content: [
      "Террасы, вода и детская зона.",
      "Комфортная среда для всех возрастов.",
    ],
  },
];
