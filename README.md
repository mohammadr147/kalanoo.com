
# کالانو | KalaNow - فروشگاه اینترنتی

این پروژه یک فروشگاه اینترنتی کامل با پنل کاربری و پنل مدیریت مجزا است که با استفاده از Next.js (JavaScript), Node.js (برای APIهای سمت سرور که در این نسخه مستقیماً در Next.js Server Actions پیاده‌سازی شده) و پایگاه داده MySQL توسعه یافته است.

**توجه:** این پروژه از هیچ‌یک از سرویس‌های Firebase استفاده نمی‌کند و تماماً بر اساس MySQL و احراز هویت مبتنی بر Session/Cookie (برای ادمین) و OTP (برای کاربران) کار می‌کند.

## 🚀 راه‌اندازی و نصب (محیط لوکال)

1.  **کلون کردن ریپازیتوری:**
    ```bash
    git clone <your-repository-url>
    cd kalanow
    ```

2.  **نصب وابستگی‌ها:**
    ```bash
    npm install
    # یا اگر از yarn استفاده می‌کنید:
    # yarn install
    ```

3.  **راه‌اندازی پایگاه داده MySQL:**
    *   یک پایگاه داده جدید در MySQL ایجاد کنید (مثلاً با نام `kalanow_db`).
    *   فایل `database_dump.sql` موجود در ریشه پروژه را در پایگاه داده خود ایمپورت کنید. این فایل شامل ساختار جداول اولیه، کاربر ادمین پیش‌فرض و محصولات نمونه است.
        ```bash
        mysql -u <your_username> -p kalanow_db < database_dump.sql
        ```
        (نام کاربری و نام دیتابیس خود را جایگزین کنید)

4.  **تنظیم متغیرهای محیطی:**
    *   فایل `.env.example` را به `.env.local` کپی کنید:
        ```bash
        cp .env.example .env.local
        ```
    *   مقادیر موجود در `.env.local` را با اطلاعات صحیح پایگاه داده MySQL و سایر تنظیمات مورد نیاز خود پر کنید. به فایل `.env.example` برای لیست کامل متغیرها مراجعه کنید. مهمترین متغیرها:
        *   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
        *   `ADMIN_USERNAME`, `ADMIN_PASSWORD`
        *   `JWT_SECRET` (یک کلید مخفی قوی برای سشن‌های ادمین)
        *   `SMS_API_KEY`, `SMS_SENDER_NUMBER` (برای پنل پیامک، مثلاً Kavenegar)
        *   `PAYMENT_GATEWAY_MERCHANT_ID`, `PAYMENT_GATEWAY_CALLBACK_URL` (برای درگاه پرداخت)
        *   `ADMIN_NOTIFICATION_PHONE`, `ADMIN_NOTIFICATION_EMAIL` (برای اطلاع‌رسانی به مدیر)

5.  **اجرای برنامه در حالت توسعه (Development):**
    ```bash
    npm run dev
    ```
    برنامه در آدرس `http://localhost:9002` (یا پورت پیش‌فرض Next.js اگر متغیر محیطی `PORT` توسط سیستم تنظیم نشده باشد) قابل دسترس خواهد بود. اسکریپت `dev` در `package.json` به این صورت تنظیم شده است: `"next dev --turbopack -p ${PORT:-9002}"`

    **اجرای با PM2 در حالت توسعه (اختیاری):**
    می‌توانید از فایل `process.dev.yml` برای اجرای برنامه با PM2 در حالت توسعه استفاده کنید (مناسب برای تست روی VPS در حالت توسعه):
    ```bash
    pm2 start process.dev.yml
    ```
    مطمئن شوید مسیر `cwd` در `process.dev.yml` به ریشه پروژه شما اشاره دارد (معمولاً `./` اگر از ریشه پروژه اجرا می‌کنید).

## 📦 انتشار پروژه (Deployment)

### ۱. انتشار در محیط پروداکشن روی سرور مجازی (VPS) با Nginx و PM2

این راهنما فرض می‌کند شما به سرور مجازی (VPS) با سیستم عامل لینوکس (مانند Ubuntu) دسترسی SSH دارید.

1.  **آماده‌سازی سرور:**
    *   **اتصال به سرور:** از طریق SSH به VPS خود متصل شوید.
    *   **نصب Node.js و npm/yarn:** (توصیه می‌شود از آخرین نسخه LTS Node.js استفاده کنید، مثلا 20.x)
        ```bash
        # مثال برای نصب Node.js 20.x در اوبونتو
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        # بررسی نسخه‌ها
        node -v
        npm -v
        ```
    *   **نصب PM2:** (برای مدیریت فرآیند Node.js)
        ```bash
        sudo npm install pm2 -g
        ```
    *   **نصب Nginx:** (به عنوان Reverse Proxy)
        ```bash
        sudo apt update
        sudo apt install nginx
        ```
    *   **نصب MySQL Server (اگر دیتابیس روی همین سرور است):**
        ```bash
        sudo apt install mysql-server
        sudo mysql_secure_installation # برای تنظیمات امنیتی اولیه
        ```

2.  **آپلود پروژه به سرور:**
    *   پروژه خود را از طریق `git clone` یا ابزارهایی مانند `scp` یا `rsync` به سرور منتقل کنید (مثلاً در پوشه `/var/www/kalanow`).
    *   پوشه‌های `node_modules` و `.next` (اگر وجود دارند) را آپلود نکنید.

3.  **راه‌اندازی پایگاه داده MySQL روی سرور (در صورت نیاز):**
    *   وارد MySQL شوید: `sudo mysql -u root -p`
    *   یک دیتابیس جدید ایجاد کنید: `CREATE DATABASE kalanow_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    *   یک کاربر جدید برای دیتابیس ایجاد کرده و دسترسی‌های لازم را بدهید:
        ```sql
        CREATE USER 'kalanow_user'@'localhost' IDENTIFIED BY 'your_strong_password';
        GRANT ALL PRIVILEGES ON kalanow_db.* TO 'kalanow_user'@'localhost';
        FLUSH PRIVILEGES;
        EXIT;
        ```
    *   فایل `database_dump.sql` را به سرور منتقل کرده و در دیتابیس ایمپورت کنید:
        ```bash
        mysql -u kalanow_user -p kalanow_db < /path/to/your/database_dump.sql
        ```

4.  **تنظیم متغیرهای محیطی سرور:**
    *   در مسیر پروژه روی سرور (مثلاً `/var/www/kalanow`)، یک فایل `.env.production` ایجاد کنید و تمام متغیرهای محیطی لازم (مانند اطلاعات اتصال به دیتابیس، `NODE_ENV=production`, `PORT=9002` (یا هر پورت دلخواه دیگر که Next.js روی آن اجرا می‌شود)، `JWT_SECRET` قوی و سایر کلیدهای API) را در آن قرار دهید.
    *   **مهم:** مطمئن شوید پورتی که اپلیکیشن Next.js روی آن اجرا می‌شود (مثلاً 9002) با پورتی که در تنظیمات Nginx به عنوان `proxy_pass` استفاده می‌کنید، هماهنگ باشد.

5.  **نصب وابستگی‌ها و Build پروژه:**
    *   وارد پوشه پروژه روی سرور شوید: `cd /var/www/kalanow`
    *   وابستگی‌ها را نصب کنید:
        ```bash
        npm install --production
        ```
    *   پروژه را Build کنید:
        ```bash
        npm run build
        ```
        این دستور پوشه `.next` را برای محیط پروداکشن ایجاد می‌کند.

6.  **اجرای برنامه با PM2:**
    *   یک فایل پیکربندی برای PM2 ایجاد کنید، مثلاً `ecosystem.config.js` (یا `process.prod.yml`) در ریشه پروژه روی سرور:
        ```javascript
        // ecosystem.config.js
        module.exports = {
          apps : [{
            name   : "kalanow-app-prod", // نام منحصر به فرد برای PM2
            script : "npm",
            args   : "start", // این اسکریپت 'next start -p $PORT' را از package.json اجرا می‌کند
            cwd    : "/var/www/kalanow", // مسیر صحیح پروژه شما
            instances: "max", // یا تعداد هسته‌های مورد نظر
            exec_mode: "cluster",
            autorestart: true,
            watch: false, // در پروداکشن معمولاً false است
            env: {
              NODE_ENV: "production",
              PORT: 9002 // پورتی که Next.js روی آن اجرا می‌شود (باید با package.json هماهنگ باشد)
            }
          }]
        }
        ```
        **توجه:** مقدار `PORT` در `env` باید با پورتی که `npm start` (از `package.json`) استفاده می‌کند، یکسان باشد. اگر اسکریپت `start` شما به این شکل است: `"start": "next start -p ${PORT:-9002}"`، PM2 متغیر `PORT` را تنظیم خواهد کرد.
    *   اپلیکیشن را با PM2 اجرا کنید:
        ```bash
        pm2 start ecosystem.config.js
        ```
    *   برای اینکه PM2 پس از ریبوت سرور به طور خودکار اجرا شود:
        ```bash
        pm2 startup
        # دستوری که نمایش داده می‌شود را کپی و اجرا کنید (معمولاً با sudo)
        pm2 save
        ```
    *   برای مشاهده لاگ‌ها: `pm2 logs kalanow-app-prod`

7.  **پیکربندی Nginx به عنوان Reverse Proxy:**
    *   یک فایل کانفیگ جدید برای سایت خود در Nginx ایجاد کنید (مثلاً `/etc/nginx/sites-available/kalanow`):
        ```nginx
        server {
            listen 80;
            listen [::]:80; # برای IPv6

            server_name your_domain.com www.your_domain.com; # دامنه خود را جایگزین کنید

            # برای فایل‌های حجیم (اختیاری)
            client_max_body_size 20M;

            location / {
                proxy_pass http://localhost:9002; # پورتی که اپلیکیشن Next.js روی آن اجرا می‌شود
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_cache_bypass $http_upgrade;
            }

            # برای فایل‌های استاتیک Next.js (بهبود عملکرد)
            location /_next/static {
                alias /var/www/kalanow/.next/static; # مسیر صحیح به پوشه static پروژه شما
                expires 1y;
                access_log off;
                add_header Cache-Control "public, must-revalidate";
            }

            location /static { # اگر فایل‌های دیگری در public/static دارید
                alias /var/www/kalanow/public/static;
                expires 1y;
                access_log off;
                add_header Cache-Control "public, must-revalidate";
            }
             location /uploads { # برای دسترسی به تصاویر آپلود شده
                alias /var/www/kalanow/public/uploads;
                expires 1y;
                access_log off;
                add_header Cache-Control "public, must-revalidate";
            }
        }
        ```
        **مهم:** `your_domain.com`، `localhost:9002` و مسیرهای `alias` را با مقادیر صحیح خود جایگزین کنید.
    *   یک لینک سیمبولیک برای فعال کردن سایت ایجاد کنید:
        ```bash
        sudo ln -s /etc/nginx/sites-available/kalanow /etc/nginx/sites-enabled/
        ```
    *   کانفیگ Nginx را تست کنید: `sudo nginx -t`
    *   اگر تست موفق بود، Nginx را ری‌استارت کنید: `sudo systemctl restart nginx`

8.  **پیکربندی فایروال (مثلاً UFW):**
    *   اجازه دسترسی به پورت‌های HTTP (80) و HTTPS (443) و SSH را بدهید:
        ```bash
        sudo ufw allow 'Nginx Full'
        sudo ufw allow OpenSSH
        sudo ufw enable
        sudo ufw status
        ```

9.  **(اختیاری) تنظیم SSL با Let's Encrypt:**
    *   Certbot را نصب کنید: `sudo apt install certbot python3-certbot-nginx`
    *   گواهی SSL را دریافت و Nginx را پیکربندی کنید:
        ```bash
        sudo certbot --nginx -d your_domain.com -d www.your_domain.com
        ```
    *   دستورالعمل‌ها را دنبال کنید. Certbot به طور خودکار تنظیمات Nginx شما را برای HTTPS به‌روز می‌کند.

10. **بررسی نهایی:**
    *   وب‌سایت خود را در مرورگر باز کنید. تمام بخش‌ها را تست کنید.

**عیب‌یابی:**
*   **لاگ‌های PM2:** `pm2 logs kalanow-app-prod`
*   **لاگ‌های Nginx:** معمولاً در `/var/log/nginx/error.log` و `/var/log/nginx/access.log`.
*   **وضعیت سرویس‌ها:** `sudo systemctl status nginx`, `sudo systemctl status mysql`, `pm2 list`.

## 🗃️ ساختار پایگاه داده (MySQL)

فایل `database_dump.sql` شامل ساختار و داده‌های نمونه برای جداول زیر است (لیست ممکن است کامل نباشد و بر اساس آخرین تغییرات پروژه است):

*   `users`: اطلاعات کاربران (شامل نام، نام خانوادگی، موبایل، کد ملی، آدرس، کد پستی، تاریخ تولد، کد معرف، معرف، موجودی کیف پول، نقش، تاریخ ایجاد و ...)
*   `products`: اطلاعات محصولات (نام، توضیحات، قیمت‌ها، موجودی، تصاویر، دسته‌بندی و ...)
*   `categories`: دسته‌بندی محصولات (نام، اسلاگ، والد، تصویر، ترتیب نمایش، فعال بودن)
*   `orders`: سفارشات ثبت‌شده (اطلاعات کاربر، محصولات، مبلغ کل، وضعیت، آدرس، روش پرداخت، جزئیات پرداخت، کد کوپن)
*   `order_items`: جزئیات آیتم‌های هر سفارش (این جدول در `database_dump.sql` فعلی به صورت مستقیم ایجاد نشده و اطلاعات آیتم‌ها به صورت JSON در جدول `orders` ذخیره می‌شود. در صورت نیاز به گزارش‌گیری پیشرفته، این جدول باید ایجاد شود.)
*   `coupons`: کوپن‌های تخفیف (کد، نوع، مقدار، تاریخ انقضا، محدودیت استفاده، تعداد استفاده شده)
*   `transactions`: تراکنش‌های کیف پول کاربران (واریز، برداشت، خرید، پورسانت، درخواست تسویه)
*   `banners`: بنرهای صفحه اصلی (تصویر دسکتاپ و موبایل، لینک، ترتیب نمایش، فعال بودن)
*   `landing_pages`: لندینگ پیج‌های کمپین‌ها (عنوان، اسلاگ، محتوا، فعال بودن)
*   `sms_logs`: تاریخچه پیامک‌های ارسالی (گیرنده، محتوا، وضعیت، شناسه ارائه‌دهنده)
*   `email_logs`: تاریخچه ایمیل‌های ارسالی (گیرنده، موضوع، وضعیت)
*   `settings`: تنظیمات کلی سایت، پورسانت، درگاه پرداخت و پیامک (به‌صورت key-value یا یک ردیف با ستون‌های متعدد)
*   `info_pages`: صفحات اطلاعاتی (درباره ما، تماس با ما، قوانین و ...)
*   `otp_codes`: برای ذخیره کدهای یکبار مصرف احراز هویت (شامل شماره موبایل، کد، تاریخ انقضا، استفاده شده)
*   `tickets`: برای سیستم تیکتینگ پشتیبانی (کاربر، موضوع، وضعیت، اولویت)
*   `ticket_messages`: برای پیام‌های هر تیکت (ارسال‌کننده، پیام، تاریخ)

## 🔑 سطح دسترسی‌ها

*   **کاربر عادی:** دسترسی به پنل کاربری (`/user/*`)، ثبت سفارش، مشاهده اطلاعات خود، ارسال تیکت.
*   **ادمین:** دسترسی کامل به پنل مدیریت (`/admin/*`). (نقش‌های دقیق‌تر مانند مدیر محصول، مدیر مالی و... قابل پیاده‌سازی است).

## 📄 مسیرهای مهم

(لیست کامل مسیرها در فایل `route.txt` موجود است)

## ✨ افزودن ادمین جدید

ادمین پیش‌فرض با نام کاربری و رمز عبوری که در متغیرهای محیطی (`ADMIN_USERNAME` و `ADMIN_PASSWORD`) یا مستقیماً در اکشن لاگین ادمین (`src/app/actions.ts`) تعریف شده، قابل استفاده است. در حال حاضر، سیستم از جدول مجزای `admins` استفاده نمی‌کند و احراز هویت ادمین با مقادیر ثابت انجام می‌شود. برای امنیت بیشتر در محیط پروداکشن، توصیه می‌شود رمز عبور ادمین را در متغیرهای محیطی سرور تنظیم کنید و آن را پیچیده انتخاب نمایید.

## 🌐 ساخت لندینگ پیج

از بخش "مدیریت لندینگ پیج‌ها" در پنل ادمین می‌توانید صفحات کمپین سفارشی با محتوای دلخواه ایجاد کنید. آدرس این صفحات به‌صورت `/landing/{slug}` خواهد بود که `{slug}` شناسه‌ی منحصر به فرد هر لندینگ است. (این بخش نیاز به تکمیل فرم و اکشن‌های مربوطه در پنل ادمین دارد).

## 🛡️ نکات امنیتی و توسعه

*   **رمزهای عبور:** حتماً رمز عبور ادمین‌ها را پیچیده انتخاب کنید و در متغیرهای محیطی سرور نگهداری کنید.
*   **اعتبارسنجی:** اعتبارسنجی ورودی‌ها را هم در سمت کلاینت (برای بهبود تجربه کاربری) و هم در سمت سرور (برای امنیت) با استفاده از کتابخانه‌ای مانند Zod انجام دهید.
*   **متغیرهای محیطی:** هرگز اطلاعات حساس مانند کلیدهای API، رمز عبور دیتابیس و JWT secret را در کد قرار ندهید و از فایل `.env.production` (برای پروداکشن) و متغیرهای محیطی سرور استفاده کنید. فایل `.env.production` نباید در Git commit شود.
*   **وابستگی‌ها:** به‌طور منظم وابستگی‌های پروژه (npm packages) را به‌روزرسانی کنید (`npm update`).
*   **HTTPS:** در محیط پروداکشن حتماً از HTTPS استفاده کنید (با استفاده از Let's Encrypt یا گواهی دیگر).
*   **PM2 Security:** از ویژگی‌های امنیتی PM2 مانند `unmask` و اجرای فرآیند با کاربر با دسترسی محدود استفاده کنید.
*   **Firewall:** فایروال سرور خود (مانند `ufw`) را به درستی پیکربندی کنید تا فقط پورت‌های ضروری باز باشند.
*   **SQL Injection:** هنگام کار با دیتابیس، از Prepared Statements یا ORM هایی که از آن پشتیبانی می‌کنند استفاده کنید تا از حملات SQL Injection جلوگیری شود. (کتابخانه `mysql2` از prepared statements پشتیبانی می‌کند).
*   **XSS (Cross-Site Scripting):** هنگام نمایش محتوای تولید شده توسط کاربر (مانند نظرات یا پیام‌ها)، از escape کردن مناسب برای جلوگیری از حملات XSS اطمینان حاصل کنید.
*   **CSRF (Cross-Site Request Forgery):** برای فرم‌هایی که عملیات حساسی انجام می‌دهند (مانند تغییر رمز عبور یا حذف داده)، از توکن‌های CSRF استفاده کنید.

## 📞 پشتیبانی

(در این بخش می‌توانید اطلاعات تماس یا لینک به مستندات بیشتر را قرار دهید)

#   K a l a n o o . c o m  
 