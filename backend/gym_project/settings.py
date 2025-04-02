# backend/gym_project/settings.py

import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent # Bu dosyanın iki üst dizini (backend klasörü)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-=!#(YERINE_GÜVENLİ_BİR_ANAHTAR_KOYUN)!#=' # Lütfen bunu değiştirin!

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True # Lokal geliştirme için

ALLOWED_HOSTS = [] # Canlıda alan adınızı ekleyin


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Üçüncü parti uygulamalar
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    # Kendi uygulamamız
    'gym_app', # Uygulama adımız
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', # CORS eklendi
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'gym_project.urls' # Ana urls.py dosyamız

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'gym_project.wsgi.application'


# Database
# Lokal geliştirme için SQLite (daha kolay başlangıç)
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3', # db.sqlite3 dosyası backend klasöründe oluşacak
#     }
# }

# PostgreSQL için ayar (kullanıcıdan gelen bilgilerle)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gym_db',         # PostgreSQL'de oluşturduğunuz veritabanının adı
        'USER': 'gymadm',         # Sağladığınız kullanıcı adı
        'PASSWORD': 'man4763!',   # Sağladığınız şifre
        'HOST': 'localhost',      # Veritabanı sunucusunun adresi (Lokal için)
        'PORT': '5432',           # PostgreSQL varsayılan portu
    }
}
# Render deploy için DATABASE_URL çevre değişkenini kullanmak daha iyidir.
# import dj_database_url
# if 'DATABASE_URL' in os.environ:
#     DATABASES['default'] = dj_database_url.config(conn_max_age=600, ssl_require=True)


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# Internationalization
LANGUAGE_CODE = 'tr-tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
# STATIC_ROOT = BASE_DIR / 'staticfiles' # Render deploy için


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Özel Kullanıcı Modeli Ayarı
AUTH_USER_MODEL = 'gym_app.CustomUser'

# Django REST Framework Ayarları
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ]
}

# CORS Ayarları
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173", # Vite React uygulamasının varsayılan adresi
    "http://127.0.0.1:5173",
    # Canlı frontend adresini de ekleyebilirsiniz
]
# Veya DEBUG True iken:
# CORS_ALLOW_ALL_ORIGINS = True