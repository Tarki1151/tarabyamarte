from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import SportProgram, MembershipPlan
from .serializers import CustomUserSerializer, SportProgramSerializer, MembershipPlanSerializer

class SportProgramViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SportProgram.objects.filter(is_active=True)
    serializer_class = SportProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = CustomUserSerializer(request.user, context={'request': request})
        return Response(serializer.data)
