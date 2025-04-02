from django.urls import path, include
from rest_framework.routers import DefaultRouter
# View'ları import ediyoruz
from .views import SportProgramViewSet, MembershipPlanViewSet, CurrentUserView

# DRF için bir router oluşturuyoruz. ViewSet'leri otomatik olarak URL'lere bağlar.
router = DefaultRouter()
router.register(r'programs', SportProgramViewSet, basename='sportprogram') # /api/programs/ endpoint'i
router.register(r'plans', MembershipPlanViewSet, basename='membershipplan') # /api/plans/ endpoint'i

# Uygulama seviyesindeki URL pattern'leri
urlpatterns = [
    # Router tarafından oluşturulan URL'leri dahil ediyoruz
    path('', include(router.urls)),
    # Mevcut kullanıcı bilgisini getiren endpoint
    path('users/me/', CurrentUserView.as_view(), name='current-user'),
]