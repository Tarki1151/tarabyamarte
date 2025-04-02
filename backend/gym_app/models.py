# backend/gym_app/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

# 1. Özelleştirilmiş Kullanıcı Modeli
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Üye'),
        ('trainer', 'Eğitmen'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member', verbose_name="Kullanıcı Rolü")
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="Telefon Numarası")
    address = models.TextField(blank=True, null=True, verbose_name="Adres")

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    class Meta:
        verbose_name = "Kullanıcı"
        verbose_name_plural = "Kullanıcılar"

# 3. Spor Programı Modeli
class SportProgram(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Program Adı")
    description = models.TextField(blank=True, null=True, verbose_name="Açıklama")
    is_active = models.BooleanField(default=True, verbose_name="Aktif Mi?")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Spor Programı"
        verbose_name_plural = "Spor Programları"
        ordering = ['name']

# 4. Üyelik Planı Modeli
class MembershipPlan(models.Model):
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

# 5. Üyelik Modeli
class Membership(models.Model):
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships', limit_choices_to={'role': 'member'}, verbose_name="Üye")
    plan = models.ForeignKey(MembershipPlan, on_delete=models.PROTECT, related_name='members', verbose_name="Üyelik Planı")
    start_date = models.DateField(default=timezone.now, verbose_name="Başlangıç Tarihi")
    end_date = models.DateField(blank=True, null=True, verbose_name="Bitiş Tarihi")
    remaining_sessions = models.PositiveIntegerField(blank=True, null=True, verbose_name="Kalan Ders Sayısı")
    is_active = models.BooleanField(default=True, verbose_name="Aktif Üyelik Mi?")

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        update_fields = kwargs.get('update_fields', None)
        if is_new or (update_fields and 'plan' in update_fields):
             if self.plan.plan_type == 'days' and self.plan.duration_days:
                 self.end_date = self.start_date + timezone.timedelta(days=self.plan.duration_days)
                 self.remaining_sessions = None
             elif self.plan.plan_type == 'sessions' and self.plan.session_count:
                 self.remaining_sessions = self.plan.session_count
                 self.end_date = None

        if update_fields is None or 'is_active' in update_fields:
            if self.is_expired:
                self.is_active = False

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.member.get_full_name() or self.member.username} - {self.plan.name}"

    @property
    def remaining_days(self):
        if self.plan.plan_type == 'days' and self.end_date:
            today = timezone.now().date()
            if self.is_active and self.end_date >= today and self.start_date <= today:
                return (self.end_date - today).days
        return 0

    @property
    def is_expired(self):
        today = timezone.now().date()
        if self.plan.plan_type == 'days' and self.end_date and self.end_date < today:
            return True
        if self.plan.plan_type == 'sessions' and self.remaining_sessions is not None and self.remaining_sessions <= 0:
            return True
        if not self.is_active:
             if self.start_date > today:
                 return False
             return True
        return False

    class Meta:
        verbose_name = "Üyelik"
        verbose_name_plural = "Üyelikler"
        ordering = ['-start_date', 'member']

# 6. Randevu/Ders Kaydı Modeli
class Appointment(models.Model):
    member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments', limit_choices_to={'role': 'member'}, verbose_name="Üye")
    program = models.ForeignKey(SportProgram, on_delete=models.CASCADE, related_name='appointments', verbose_name="Spor Programı")
    appointment_datetime = models.DateTimeField(verbose_name="Randevu Zamanı")
    attended = models.BooleanField(default=False, verbose_name="Katıldı Mı?")
    created_at = models.DateTimeField(auto_now_add=True)
    _original_attended = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_attended = self.attended

    def save(self, *args, **kwargs):
        if self.attended and not self._original_attended:
            try:
                membership = Membership.objects.filter(
                    member=self.member,
                    plan__plan_type='sessions',
                    is_active=True,
                    start_date__lte=self.appointment_datetime.date(),
                    remaining_sessions__gt=0
                ).order_by('start_date').first()

                if membership:
                    membership.remaining_sessions -= 1
                    if membership.remaining_sessions <= 0:
                        membership.is_active = False
                    membership.save(update_fields=['remaining_sessions', 'is_active'])
                    print(f"Üye {self.member.username} için kalan seans: {membership.remaining_sessions}")
                else:
                    print(f"HATA: Üye {self.member.username} için katılım kaydedilecek uygun seans bazlı üyelik bulunamadı!")
                    # self.attended = False # Hakkı yoksa katılmış sayma

            except Exception as e:
                print(f"HATA: Kalan seans düşürülürken hata oluştu: {e}")
                pass

        super().save(*args, **kwargs)
        self._original_attended = self.attended

    def __str__(self):
        return f"{self.member.username} - {self.program.name} - {self.appointment_datetime.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = "Randevu / Ders Kaydı"
        verbose_name_plural = "Randevular / Ders Kayıtları"
        ordering = ['-appointment_datetime']
        constraints = [
            models.UniqueConstraint(fields=['member', 'appointment_datetime'], name='unique_appointment_time_for_member')
        ]

# 7. Genel Ayarlar Modeli
class GymSetting(models.Model):
    key = models.CharField(max_length=50, unique=True, primary_key=True, verbose_name="Ayar Adı")
    value = models.TextField(verbose_name="Ayar Değeri")

    def __str__(self):
        return self.key

    class Meta:
        verbose_name = "Genel Ayar"
        verbose_name_plural = "Genel Ayarlar"