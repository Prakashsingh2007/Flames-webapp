from django.urls import path
from .views import FlamesView, FlamesHistoryView
from .auth_views import RegisterView, LoginView, LogoutView, MeView, MyResultsView

urlpatterns = [
    path('flames/', FlamesView.as_view(), name='flames'),
    path('flames/history/', FlamesHistoryView.as_view(), name='flames-history'),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    path('flames/my-results/', MyResultsView.as_view(), name='my-results'),
]