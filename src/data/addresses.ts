
/**
 * @fileOverview Contains sample address data for Iran (provinces and cities).
 * NOTE: This is a sample list and may not be exhaustive or completely up-to-date.
 */

export interface City {
  name: string;
}

export interface Province {
  name: string;
  cities: City[];
}

export const iranProvinces: Province[] = [
  {
    name: 'تهران',
    cities: [
      { name: 'تهران' },
      { name: 'اسلام‌شهر' },
      { name: 'شهریار' },
      { name: 'قدس' },
      { name: 'ملارد' },
      { name: 'پاکدشت' },
      { name: 'ورامین' },
      { name: 'قرچک' },
      { name: 'پردیس' },
      { name: 'بومهن' },
      { name: 'رودهن' },
      { name: 'دماوند' },
      { name: 'فیروزکوه' },
    ],
  },
  {
    name: 'خراسان رضوی',
    cities: [
      { name: 'مشهد' },
      { name: 'نیشابور' },
      { name: 'سبزوار' },
      { name: 'تربت حیدریه' },
      { name: 'قوچان' },
      { name: 'کاشمر' },
      { name: 'گناباد' },
      { name: 'چناران' },
      { name: 'فریمان' },
      { name: 'تربت جام' },
    ],
  },
  {
    name: 'اصفهان',
    cities: [
      { name: 'اصفهان' },
      { name: 'کاشان' },
      { name: 'خمینی‌شهر' },
      { name: 'نجف‌آباد' },
      { name: 'شاهین‌شهر' },
      { name: 'فولادشهر' },
      { name: 'شهرضا' },
      { name: 'مبارکه' },
      { name: 'زرین‌شهر' },
      { name: 'گلپایگان' },
    ],
  },
  {
    name: 'فارس',
    cities: [
      { name: 'شیراز' },
      { name: 'کازرون' },
      { name: 'جهرم' },
      { name: 'مرودشت' },
      { name: 'فسا' },
      { name: 'داراب' },
      { name: 'لارستان' },
      { name: 'اقلید' },
      { name: 'آباده' },
      { name: 'فیروزآباد' },
    ],
  },
   {
    name: 'آذربایجان شرقی',
    cities: [
      { name: 'تبریز' },
      { name: 'مراغه' },
      { name: 'مرند' },
      { name: 'اهر' },
      { name: 'میانه' },
      { name: 'بناب' },
      { name: 'سراب' },
      { name: 'آذرشهر' },
      { name: 'شبستر' },
      { name: 'اسکو' },
    ],
  },
  {
    name: 'آذربایجان غربی',
    cities: [
        { name: 'ارومیه' },
        { name: 'خوی' },
        { name: 'میاندوآب' },
        { name: 'بوکان' },
        { name: 'مهاباد' },
        { name: 'سلماس' },
        { name: 'پیرانشهر' },
        { name: 'نقده' },
        { name: 'تکاب' },
        { name: 'شاهین‌دژ' },
    ],
  },
   {
    name: 'مازندران',
    cities: [
        { name: 'ساری' },
        { name: 'بابل' },
        { name: 'آمل' },
        { name: 'قائم‌شهر' },
        { name: 'بهشهر' },
        { name: 'چالوس' },
        { name: 'نکا' },
        { name: 'بابلسر' },
        { name: 'نور' },
        { name: 'رامسر' },
    ],
  },
   {
    name: 'خوزستان',
    cities: [
        { name: 'اهواز' },
        { name: 'دزفول' },
        { name: 'آبادان' },
        { name: 'ماهشهر' },
        { name: 'اندیمشک' },
        { name: 'خرمشهر' },
        { name: 'بهبهان' },
        { name: 'ایذه' },
        { name: 'شوشتر' },
        { name: 'مسجد سلیمان' },
    ],
  },
   {
    name: 'کرمان',
    cities: [
        { name: 'کرمان' },
        { name: 'سیرجان' },
        { name: 'رفسنجان' },
        { name: 'جیرفت' },
        { name: 'بم' },
        { name: 'زرند' },
        { name: 'شهربابک' },
        { name: 'کهنوج' },
        { name: 'بافت' },
        { name: 'بردسیر' },
    ],
   },
    {
    name: 'گیلان',
    cities: [
        { name: 'رشت' },
        { name: 'بندر انزلی' },
        { name: 'لاهیجان' },
        { name: 'لنگرود' },
        { name: 'تالش' },
        { name: 'آستارا' },
        { name: 'صومعه‌سرا' },
        { name: 'رودسر' },
        { name: 'فومن' },
        { name: 'ماسال' },
    ],
    },
  // Add more provinces and cities as needed
];

// Helper function to get cities for a specific province
export function getCitiesByProvince(provinceName: string): City[] {
  const province = iranProvinces.find((p) => p.name === provinceName);
  return province ? province.cities : [];
}
