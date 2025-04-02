# Bu kod, Django projenizdeki bir uygulamanın (örneğin, 'gym_app') models.py dosyasına aittir.
# Gerekli import'ları yapıyoruz:
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings # Kullanıcı modeline referans için
from django.utils import timezone # Zaman damgaları için

# 1. Özelleştirilmiş Kullanıcı Modeli (Admin, Üye ve potansiyel Eğitmen rolleri için)
class CustomUser(AbstractUser):
    """
    Django'nun varsayılan User modelini genişleterek rolleri ve
    ekstra alanları ekleyebileceğimiz özel kullanıcı modeli.
    """
    # Kullanıcı rolleri için seçenekler
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Üye'),
        ('trainer', 'Eğitmen'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member', verbose_name="Kullanıcı Rolü")
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefon Numarası")
    address = models.TextField(blank=True, null=True, verbose_name="Adres")
    # Ekstra profil bilgileri buraya eklenebilir (Doğum tarihi, Cinsiyet vb.)

    # AbstractUser'dan gelen alanlar: username, first_name, last_name, email, password, is_staff, is_active, is_superuser, date_joined, last_login

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"


# 2. Eğitmen Modeli (Eğer eğitmene özel ek bilgiler gerekiyorsa)
# Basit tutmak için şimdilik CustomUser içindeki 'trainer' rolünü kullanabiliriz.
# Eğer eğitmene özel uzmanlık alanı, sertifika gibi detaylar gerekirse ayrı bir model oluşturulabilir:
# class TrainerProfile(models.Model):
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trainer_profile', limit_choices_to={'role': 'trainer'})
#     specialization = models.CharField(max_length=100, verbose_name="Uzmanlık Alanı")
#     bio = models.TextField(blank=True, null=True, verbose_name="Biyografi")
#     # ... diğer eğitmen özel alanları
#
#     def __str__(self):
#         return self.user.get_full_name() or self.user.username


# 3. Spor Programı Modeli
class SportProgram(models.Model):
    """
    Salonda sunulan spor programlarını (Boks, MMA, Fitness vb.) tanımlar.
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Program Adı")
    description = models.TextField(blank=True, null=True, verbose_name="Açıklama")
    # İleride eğitmen ataması için:
    # trainers = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='programs', limit_choices_to={'role': 'trainer'}, blank=True)
    is_active = models.BooleanField(default=True, verbose_name="Aktif Mi?")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Spor Programı"
        verbose_name_plural = "Spor Programları"
        ordering = ['name']


# 4. Üyelik Planı Modeli
class MembershipPlan(models.Model):
    """
    Sunulan farklı üyelik tiplerini (Gün bazlı, Ders sayısı bazlı) tanımlar.
    """
    PLAN_TYPE_CHOICES = (
        ('days', 'Gün Bazlı'),
        ('sessions', 'Ders Sayısı Bazlı'),
    )
    name = models.CharField(max_length=150, unique=True, verbose_name="Plan Adı")
    plan_type = models.CharField(max_length=10, choices=PLAN_TYPE_CHOICES, verbose_name="Plan Tipi")
    duration_days = models.PositiveIntegerField(blank=True, null=True, verbose_name="Süre (Gün)", help_text="Gün bazlı planlar için geçerlidir.")
    session_count = models.PositiveIntegerField(blank=True, null=True, verbose_name="Ders Sayısı", help_text="Ders sayısı bazlı planlar için geçerlidir.")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Fiyat")
    is_active = models.BooleanField(default=True, verbose_name="Aktif Mi?")

    def __str__(self):
        if self.plan_type == 'days':
            return f"{self.name} ({self.duration_days} Gün)"
        else:
            return f"{self.name} ({self.session_count} Ders)"

    class Meta:
        verbose_name = "Üyelik Planı"
        verbose_name_plural = "Üyelik Planları"
        ordering = ['name']


# 5. Üyelik Modeli (Üyeyi bir plana bağlar ve durumunu takip eder)
class Membership(models.Model):
    """
    Bir üyenin sahip olduğu aktif veya geçmiş üyelik planını temsil eder.
    """
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships', limit_choices_to={'role': 'member'}, verbose_name="Üye")
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT, related_name='members', verbose_name="Üyelik Planı") # Plan silinirse üyelik kalmalı
    start_date = models.DateField(default=timezone.now, verbose_name="Başlangıç Tarihi")
    end_date = models.DateField(blank=True, null=True, verbose_name="Bitiş Tarihi") # Gün bazlı için otomatik hesaplanabilir
    remaining_sessions = models.PositiveIntegerField(blank=True, null=True, verbose_name="Kalan Ders Sayısı") # Ders bazlı için
    is_active = models.BooleanField(default=True, verbose_name="Aktif Üyelik Mi?")
    # Ödeme durumu için alanlar eklenebilir (total_paid, remaining_balance vb.)
    # total_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Ödenen Tutar")

    def save(self, *args, **kwargs):
        # Gün bazlı planlar için bitiş tarihini otomatik hesapla (eğer yoksa)
        if self.plan.plan_type == 'days' and self.plan.duration_days and not self.end_date:
            self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
        # Ders bazlı planlar için kalan ders sayısını otomatik ata (eğer yoksa)
        if self.plan.plan_type == 'sessions' and self.plan.session_count and self.remaining_sessions is None:
             self.remaining_sessions = self.plan.session_count
        super().save(*args, **kwargs) # Asıl save metodunu çağır

    def __str__(self):
        return f"{self.member.get_full_name() or self.member.username} - {self.plan.name}"

    # Kalan gün sayısını hesaplayan bir method (gün bazlı için)
    @property
    def remaining_days(self):
        if self.plan.plan_type == 'days' and self.end_date:
            today = timezone.now().date()
            if self.end_date >= today and self.start_date <= today:
                return (self.end_date - today).days
        return 0

    # Üyeliğin süresinin dolup dolmadığını kontrol eden method
    @property
    def is_expired(self):
        today = timezone.now().date()
        if self.plan.plan_type == 'days' and self.end_date and self.end_date < today:
            return True
        if self.plan.plan_type == 'sessions' and self.remaining_sessions is not None and self.remaining_sessions <= 0:
            return True
        return False

    class Meta:
        verbose_name = "Üyelik"
        verbose_name_plural = "Üyelikler"
        ordering = ['-start_date', 'member']


# 6. Randevu/Ders Kaydı Modeli
class Appointment(models.Model):
    """
    Üyelerin belirli bir spor programı dersine katılımını veya rezervasyonunu temsil eder.
    """
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments', limit_choices_to={'role': 'member'}, verbose_name="Üye")
    program = models.ForeignKey(SportProgram, on_delete=models.CASCADE, related_name='appointments', verbose_name="Spor Programı")
    # Belirli bir ders saatini veya eğitmeni de bağlayabiliriz:
    # trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='led_appointments', limit_choices_to={'role': 'trainer'})
    appointment_datetime = models.DateTimeField(verbose_name="Randevu Zamanı")
    attended = models.BooleanField(default=False, verbose_name="Katıldı Mı?") # Katılım durumu
    created_at = models.DateTimeField(auto_now_add=True) # Kayıt oluşturulma zamanı

    def save(self, *args, **kwargs):
        # Eğer bu randevu bir derse katılım olarak işaretleniyorsa
        # ve üyenin ders sayısı bazlı aktif bir üyeliği varsa, kalan ders sayısını azalt.
        # Bu mantık daha detaylı ele alınmalı (doğru üyelik nasıl bulunur vb.)
        # Örnek:
        # is_new = self.pk is None # Yeni mi oluşturuluyor?
        # old_attended = None
        # if not is_new:
        #     old_attended = Appointment.objects.get(pk=self.pk).attended

        # if self.attended and not old_attended: # Eğer katıldı olarak işaretlendiyse ve daha önce işaretlenmemişse
        #     try:
        #         # Üyenin bu programla ilgili aktif, ders bazlı üyeliğini bul
        #         active_membership = Membership.objects.get(
        #             member=self.member,
        #             plan__plan_type='sessions',
        #             is_active=True,
        #             start_date__lte=self.appointment_datetime.date(),
        #             # Bitiş tarihi kontrolü veya başka kontroller eklenebilir
        #             remaining_sessions__gt=0
        #         )
        #         if active_membership.remaining_sessions > 0:
        #             active_membership.remaining_sessions -= 1
        #             active_membership.save()
        #     except Membership.DoesNotExist:
        #         # Uygun üyelik bulunamadı, belki hata loglanır
        #         pass
        #     except Membership.MultipleObjectsReturned:
        #         # Birden fazla uygun üyelik varsa hangi kurala göre düşülecek?
        #         pass # Şimdilik geçelim

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.member.username} - {self.program.name} - {self.appointment_datetime.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = "Randevu / Ders Kaydı"
        verbose_name_plural = "Randevular / Ders Kayıtları"
        ordering = ['-appointment_datetime']


# 7. Genel Ayarlar Modeli (Basit Key-Value)
class GymSetting(models.Model):
    """
    Uygulama genelindeki ayarları (logo URL'si vb.) saklamak için basit model.
    """
    key = models.CharField(max_length=50, unique=True, primary_key=True, verbose_name="Ayar Adı")
    value = models.TextField(verbose_name="Ayar Değeri")

    def __str__(self):
        return self.key

    class Meta:
        verbose_name = "Genel Ayar"
        verbose_name_plural = "Genel Ayarlar"

# ÖNEMLİ NOTLAR:
# 1. Bu modeller ilk taslaktır ve projenin ilerleyen aşamalarında detaylandırılabilir veya değiştirilebilir.
# 2. CustomUser modelini kullanmak için Django projesinin settings.py dosyasında AUTH_USER_MODEL = 'gym_app.CustomUser' (uygulama adınız ne ise) ayarını yapmanız gerekir. Bu ayar genellikle projeye başlarken yapılır.
# 3. Eğitmenler için ayrı bir profil modeli (TrainerProfile) veya daha detaylı ilişkilendirmeler eklenebilir.
# 4. Ödeme takibi için Membership modeline veya ayrı bir Payment modeline alanlar eklenebilir.
# 5. Randevu sistemindeki ders sayısı düşürme mantığı daha sağlam hale getirilmelidir.
