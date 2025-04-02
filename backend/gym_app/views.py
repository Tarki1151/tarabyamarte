# backend/gym_app/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SportProgram, MembershipPlan, Membership, Appointment, CustomUser
from .serializers import (
    CustomUserSerializer, SportProgramSerializer, MembershipPlanSerializer,
    MembershipSerializer, AppointmentSerializer
)
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication # TokenAuthentication'ı import edin

class UserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = CustomUserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

class IsMemberUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'member'

class IsAdminRoleUser(permissions.BasePermission):
     def has_permission(self, request, view):
         return request.user.is_authenticated and request.user.role == 'admin'

class SportProgramViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SportProgram.objects.filter(is_active=True)
    serializer_class = SportProgramSerializer
    permission_classes = [IsAuthenticated]

class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAuthenticated]

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = CustomUserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

class MemberMembershipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MembershipSerializer
    permission_classes = [IsMemberUser]

    def get_queryset(self):
        return Membership.objects.filter(member=self.request.user)

class MemberAppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = [IsMemberUser]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return Appointment.objects.filter(member=self.request.user)

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)