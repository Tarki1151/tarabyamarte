# backend/gym_app/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, SportProgram, MembershipPlan, Membership, Appointment, GymSetting

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions', 'role')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role', 'first_name', 'last_name', 'email')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

@admin.register(SportProgram)
class SportProgramAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan_type', 'duration_days', 'session_count', 'price', 'is_active')
    list_filter = ('plan_type', 'is_active')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('member', 'plan', 'start_date', 'end_date', 'remaining_sessions', 'is_active', 'remaining_days_display', 'is_expired_display')
    list_filter = ('plan', 'is_active', 'start_date', 'end_date')
    search_fields = ('member__username', 'member__first_name', 'member__last_name', 'plan__name')
    ordering = ('-start_date',)
    date_hierarchy = 'start_date'
    readonly_fields = ('end_date', 'remaining_sessions', 'remaining_days', 'is_expired')

    def remaining_days_display(self, obj):
        return obj.remaining_days
    remaining_days_display.short_description = "Kalan Gün"

    def is_expired_display(self, obj):
        return obj.is_expired
    is_expired_display.short_description = "Süresi Doldu Mu?"
    is_expired_display.boolean = True

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('member', 'program', 'appointment_datetime', 'attended')
    list_filter = ('program', 'attended', 'appointment_datetime')
    search_fields = ('member__username', 'member__first_name', 'program__name')
    ordering = ('-appointment_datetime',)
    date_hierarchy = 'appointment_datetime'
    list_editable = ('attended',)

@admin.register(GymSetting)
class GymSettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
    search_fields = ('key',)

admin.site.register(CustomUser, CustomUserAdmin)