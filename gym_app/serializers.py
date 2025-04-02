from rest_framework import serializers
from .models import CustomUser, SportProgram, MembershipPlan

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
