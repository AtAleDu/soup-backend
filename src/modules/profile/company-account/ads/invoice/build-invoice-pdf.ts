import { readFileSync } from 'fs';
import { join } from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { INVOICE_RECIPIENT } from '../invoice-recipient.constants';
import { amountInWords } from './amount-in-words';

const FONTS_DIR = join(__dirname, 'fonts');

function loadFont(path: string): Buffer {
  try {
    return readFileSync(path);
  } catch {
    throw new Error(
      `Шрифт не найден: ${path}. Убедитесь, что папка fonts с PTSans-Regular.ttf и PTSans-Bold.ttf скопирована в dist.`,
    );
  }
}

type AdvertiserData = {
  inn: string;
  kpp: string;
  shortName: string;
  fullName: string;
  phone?: string;
  email?: string;
  postalAddress?: string;
  postalCode?: string;
  legalAddress?: string;
};

type CartItemSnapshot = {
  positionTitle?: string | null;
  tariffName?: string | null;
  quantity: number;
  periodDays: number;
  lineTotal: number;
};

type BuildInvoicePdfParams = {
  invoiceNumber: string;
  invoiceDate: Date;
  advertiser: AdvertiserData;
  items: CartItemSnapshot[];
  total: number;
};

const FONT_SIZE = 10;
const FONT_SIZE_SMALL = 9;
const MARGIN = 50;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LINE_HEIGHT = 14;

const MONTH_NAMES_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatDateRu(date: Date): string {
  const d = date.getDate();
  const m = MONTH_NAMES_RU[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y} г.`;
}

function formatMoney(value: number): string {
  const n = Number(value);
  const int = Math.floor(n);
  const frac = Math.round((n - int) * 100);
  const s = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${s},${frac < 10 ? '0' : ''}${frac}`;
}

export async function buildInvoicePdf(params: BuildInvoicePdfParams): Promise<Buffer> {
  const { invoiceNumber, invoiceDate, advertiser, items, total } = params;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontRegularBytes = loadFont(join(FONTS_DIR, 'PTSans-Regular.ttf'));
  const fontBoldBytes = loadFont(join(FONTS_DIR, 'PTSans-Bold.ttf'));
  const font = await doc.embedFont(fontRegularBytes);
  const fontBold = await doc.embedFont(fontBoldBytes);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const draw = (text: string, x: number, opts?: { size?: number; bold?: boolean }) => {
    const f = opts?.bold ? fontBold : font;
    const size = opts?.size ?? FONT_SIZE;
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 2;
  };

  const drawRight = (text: string, opts?: { size?: number }) => {
    const size = opts?.size ?? FONT_SIZE;
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: PAGE_WIDTH - MARGIN - width, y, size, font, color: rgb(0, 0, 0) });
    y -= size + 2;
  };

  drawRight(INVOICE_RECIPIENT.name, { size: 11 });
  drawRight(INVOICE_RECIPIENT.legalAddress);
  drawRight(`Тел.: ${INVOICE_RECIPIENT.phone}`);
  y -= LINE_HEIGHT;

  draw('Получатель:', MARGIN, { bold: true });
  draw(`ИНН/КПП: ${INVOICE_RECIPIENT.inn}/${INVOICE_RECIPIENT.kpp}`, MARGIN);
  draw(`${INVOICE_RECIPIENT.name}`, MARGIN);
  draw(`Сч № ${INVOICE_RECIPIENT.accountNumber}`, MARGIN);
  draw(`Банк получателя: ${INVOICE_RECIPIENT.bankName}`, MARGIN);
  draw(INVOICE_RECIPIENT.bankAddress, MARGIN);
  draw(`БИК: ${INVOICE_RECIPIENT.bik}`, MARGIN);
  draw(`Сч № ${INVOICE_RECIPIENT.correspondentAccount}`, MARGIN);
  y -= LINE_HEIGHT;

  draw(`ЛИЦЕВОЙ СЧЕТ № ${invoiceNumber}`, MARGIN, { bold: true });
  draw(`от ${formatDateRu(invoiceDate)}`, MARGIN);
  draw('Заказчик:', MARGIN, { bold: true });
  if (advertiser.shortName) draw(advertiser.shortName, MARGIN);
  if (advertiser.fullName) draw(advertiser.fullName, MARGIN);
  if (advertiser.inn || advertiser.kpp) {
    draw(`ИНН/КПП: ${advertiser.inn || '—'}/${advertiser.kpp || '—'}`, MARGIN);
  }
  if (advertiser.legalAddress) draw(`Юридический адрес: ${advertiser.legalAddress}`, MARGIN);
  if (advertiser.postalCode || advertiser.postalAddress) {
    const postal = [advertiser.postalCode, advertiser.postalAddress].filter(Boolean).join(', ');
    draw(`Почтовый адрес: ${postal}`, MARGIN);
  }
  if (advertiser.phone) draw(`Телефон: ${advertiser.phone}`, MARGIN);
  if (advertiser.email) draw(`Эл. почта: ${advertiser.email}`, MARGIN);
  y -= LINE_HEIGHT;

  const tableTop = y;
  const col1 = MARGIN;
  const col2 = PAGE_WIDTH - MARGIN - 100;
  draw('№', col1, { bold: true });
  const numColW = 25;
  draw('Наименование товара, работы, услуги', col1 + numColW, { bold: true });
  draw('Сумма, рубли РФ', col2, { bold: true });
  y -= 4;

  items.forEach((item, i) => {
    const title = item.positionTitle || item.tariffName || 'Услуга';
    const desc = `${title}, кол-во ${item.quantity}, период ${item.periodDays} дн.`;
    const lineTotal = typeof item.lineTotal === 'number' ? item.lineTotal : Number(item.lineTotal);
    page.drawText(String(i + 1), { x: col1, y, size: FONT_SIZE_SMALL, font, color: rgb(0, 0, 0) });
    const maxDescW = col2 - col1 - numColW - 10;
    if (font.widthOfTextAtSize(desc, FONT_SIZE_SMALL) > maxDescW) {
      page.drawText(desc.slice(0, 45) + '...', { x: col1 + numColW, y, size: FONT_SIZE_SMALL, font, color: rgb(0, 0, 0) });
    } else {
      page.drawText(desc, { x: col1 + numColW, y, size: FONT_SIZE_SMALL, font, color: rgb(0, 0, 0) });
    }
    const sumStr = formatMoney(lineTotal);
    const sumW = font.widthOfTextAtSize(sumStr, FONT_SIZE_SMALL);
    page.drawText(sumStr, { x: col2 - sumW, y, size: FONT_SIZE_SMALL, font, color: rgb(0, 0, 0) });
    y -= LINE_HEIGHT;
  });

  y -= 4;
  draw('Всего к оплате, рубли РФ', col1, { bold: true });
  const totalStr = formatMoney(total);
  const totalW = fontBold.widthOfTextAtSize(totalStr, FONT_SIZE);
  page.drawText(totalStr, { x: col2 - totalW, y, size: FONT_SIZE, font: fontBold, color: rgb(0, 0, 0) });
  y -= LINE_HEIGHT;
  draw('НДС не облагается.', col1, { size: FONT_SIZE_SMALL });
  y -= LINE_HEIGHT;
  draw(`К оплате: ${amountInWords(total)}`, col1, { size: FONT_SIZE_SMALL });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
