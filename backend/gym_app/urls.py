# backend/gym_app/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SportProgramViewSet, MembershipPlanViewSet, CurrentUserView,
    MemberMembershipViewSet, MemberAppointmentViewSet
)

router = DefaultRouter()
router.register(r'programs', SportProgramViewSet, basename='sportprogram')
router.register(r'plans', MembershipPlanViewSet, basename='membershipplan')
router.register(r'memberships', MemberMembershipViewSet, basename='member-membership')
router.register(r'appointments', MemberAppointmentViewSet, basename='member-appointment')

urlpatterns = [
    path('', include(router.urls)),
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
]
