from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import relato_do_dia, relato_aleatorio, AppointmentViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'user-profile', UserProfileViewSet, basename='user-profile')

urlpatterns = [
    path("relato-do-dia/", relato_do_dia),
    path("relato-aleatorio/", relato_aleatorio),
    path('', include(router.urls)),
]
