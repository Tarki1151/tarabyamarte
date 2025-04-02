# backend/gym_app/serializers.py

from rest_framework import serializers
from django.utils import timezone
from .models import CustomUser, SportProgram, MembershipPlan, Membership, Appointment

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone_number', 'address', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'role', 'is_active', 'date_joined']

class SportProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = SportProgram
        fields = ['id', 'name', 'description', 'is_active']

class MembershipPlanSerializer(serializers.ModelSerializer):
    plan_type_display = serializers.CharField(source='get_plan_type_display', read_only=True)
    class Meta:
        model = MembershipPlan
        fields = [
            'id', 'name', 'plan_type', 'plan_type_display',
            'duration_days', 'session_count', 'price', 'is_active'
        ]

class MembershipSerializer(serializers.ModelSerializer):
    plan = MembershipPlanSerializer(read_only=True)
    remaining_days = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Membership
        fields = [
            'id', 'plan', 'start_date', 'end_date',
            'remaining_sessions', 'is_active', 'remaining_days', 'is_expired'
        ]
        read_only_fields = ['id', 'plan', 'start_date', 'end_date', 'remaining_sessions', 'is_active', 'remaining_days', 'is_expired']

class AppointmentSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    member_name = serializers.CharField(source='member.get_full_name', read_only=True)
    member = CustomUserSerializer(read_only=True)
    program = serializers.PrimaryKeyRelatedField(queryset=SportProgram.objects.filter(is_active=True))

    class Meta:
        model = Appointment
        fields = [
            'id', 'member', 'member_name', 'program', 'program_name',
            'appointment_datetime', 'attended', 'created_at'
        ]
        read_only_fields = ['id', 'member', 'member_name', 'program_name', 'attended', 'created_at']

    def validate_appointment_datetime(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Geçmiş bir tarihe randevu alamazsınız.")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
             return data
        member = request.user
        appointment_time = data.get('appointment_datetime')

        if member.role != 'member':
             raise serializers.ValidationError("Sadece üyeler randevu alabilir.")

        active_memberships = Membership.objects.filter(
            member=member,
            is_active=True,
            start_date__lte=appointment_time.date()
        )

        valid_membership_found = False
        for membership in active_memberships:
            if membership.plan.plan_type == 'days':
                if membership.end_date and membership.end_date >= appointment_time.date():
                    valid_membership_found = True
                    break
            elif membership.plan.plan_type == 'sessions':
                if membership.remaining_sessions is not None and membership.remaining_sessions > 0:
                    valid_membership_found = True
                    break

        if not valid_membership_found:
            raise serializers.ValidationError("Randevu almak için geçerli ve aktif bir üyeliğiniz bulunmamaktadır veya hakkınız bitmiştir.")

        instance = getattr(self, 'instance', None)
        queryset = Appointment.objects.filter(
            member=member,
            appointment_datetime=appointment_time
        )
        if instance:
            queryset = queryset.exclude(pk=instance.pk)

        if queryset.exists():
             raise serializers.ValidationError("Bu zaman dilimi için zaten bir randevunuz bulunmaktadır.")

        return data