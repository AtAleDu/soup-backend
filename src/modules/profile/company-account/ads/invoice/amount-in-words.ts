const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];

function hundredsToWords(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  const parts: string[] = [];
  if (h === 1) parts.push('сто');
  else if (h === 2) parts.push('двести');
  else if (h >= 3 && h <= 4) parts.push(h === 3 ? 'триста' : 'четыреста');
  else if (h >= 5 && h <= 9) parts.push(['пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'][h - 5]);
  if (t === 1) parts.push(teens[o]);
  else {
    if (t >= 2) parts.push(tens[t]);
    if (o >= 1) parts.push(ones[o]);
  }
  return parts.join(' ');
}

function rublesToWords(value: number): string {
  const int = Math.floor(value);
  if (int === 0) return 'Ноль рублей';
  const groups: string[] = [];
  const thousands = Math.floor(int / 1000) % 1000;
  const units = int % 1000;
  if (thousands > 0) {
    let t = hundredsToWords(thousands);
    if (thousands >= 5 && thousands <= 20) t += ' тысяч';
    else {
      const last = thousands % 10;
      if (last === 1 && thousands % 100 !== 11) t += ' тысяча';
      else if (last >= 2 && last <= 4 && (thousands % 100 < 10 || thousands % 100 >= 20)) t += ' тысячи';
      else t += ' тысяч';
    }
    groups.push(t);
  }
  if (units > 0) groups.push(hundredsToWords(units));
  let rub = groups.join(' ');
  const lastDigit = int % 10;
  const lastTwo = int % 100;
  if (lastTwo >= 11 && lastTwo <= 19) rub += ' рублей';
  else if (lastDigit === 1) rub += ' рубль';
  else if (lastDigit >= 2 && lastDigit <= 4) rub += ' рубля';
  else rub += ' рублей';
  return rub;
}

export function amountInWords(value: number): string {
  const int = Math.floor(value);
  const kop = Math.round((value - int) * 100);
  const rub = rublesToWords(value);
  const kopStr = kop < 10 ? `0${kop}` : String(kop);
  return `${rub} ${kopStr} копеек`;
}
