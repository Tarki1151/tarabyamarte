from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken import views as authtoken_views
from gym_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('gym_app.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/token-auth/', authtoken_views.obtain_auth_token),
    path('api/profile/', views.UserProfileView.as_view()),
    path('api/', include('rest_framework.authtoken.urls')), # Bu satırı da ekleyelim
]