import { BlogStatus } from "../../entities/Blog/blog.entity";

type BlogSeedItem = {
  title: string;
  description: string;
  imageUrl: string;
  status: BlogStatus;
  contentBlocks?: unknown[] | null;
};

export const BLOG_DATA: BlogSeedItem[] = [
  {
    title: "«Уральский Марс» станет центром астрономического туризма",
    description:
      "Агентство по привлечению инвестиций Свердловской области взяло на сопровождение футуристический проект по созданию глэмпинг-обсерватории. Реализация проекта намечена на 2027 год, объем инвестиций – 56 млн руб.",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg",
    status: BlogStatus.PUBLISHED,
    contentBlocks: [
      { type: "subtitle2", text: "О проекте" },
      {
        type: "bulletList",
        items: ["Глэмпинг-обсерватория", "Инвестиции 56 млн руб.", "Реализация в 2027 году"],
      },
    ],
  },
  {
    title: "Гид архитектора по нормам пожаростойкого остекления",
    description:
      "Проектировщики регулярно сталкиваются с замечаниями при согласовании светопрозрачных противопожарных конструкций и затянутыми в связи с этим сроками. Предлагаем решение этой задачи.",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg",
    status: BlogStatus.PUBLISHED,
    contentBlocks: [
      { type: "subtitle2", text: "Нормативная база" },
      { type: "divider" },
      {
        type: "numberedList",
        items: ["Требования к остеклению", "Испытания и сертификация", "Типовые решения"],
      },
    ],
  },
  {
    title: "Благоустройство общественных пространств: опыт и практика",
    description:
      "Как совместить функциональность, эстетику и комфорт в проектах благоустройства. Разбираем кейсы и делимся опытом.",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg",
    status: BlogStatus.PUBLISHED,
    contentBlocks: [
      { type: "subtitle2", text: "Ключевые принципы" },
      { type: "subtitle3", text: "Работа с контекстом" },
      { type: "image", url: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg" },
    ],
  },
  {
    title: "Эко-материалы в современной архитектуре",
    description:
      "Обзор материалов с низким углеродным следом и их применение в проектах. Тренды и реальные примеры.",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg",
    status: BlogStatus.PUBLISHED,
  },
  {
    title: "Черновик: будущая статья о реконструкции",
    description: "Материал в работе. Планируем опубликовать в следующем месяце.",
    imageUrl: "https://s3.twcstorage.ru/4b615622-soup/blogs/Frame%202136138513.svg",
    status: BlogStatus.DRAFT,
  },
];