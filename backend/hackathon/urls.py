from django.urls import path
from .views import (
    HealthView,
    ApiLoginView,
    ApiRegisterView,
    ApiLogoutView,
    ApiMeView,
    ApiRandomRoundView,
    ApiSubmitRoundView,
    ApiMyResultsView,
)

urlpatterns = [
    path("", HealthView.as_view(), name="health"),

    # Auth APIs
    path("api/login", ApiLoginView.as_view(), name="api_login"),
    path("api/register", ApiRegisterView.as_view(), name="api_register"),
    path("api/me", ApiMeView.as_view(), name="api_me"),
    path("api/logout", ApiLogoutView.as_view(), name="api_logout"),

    # Game APIs
    path("api/round/random", ApiRandomRoundView.as_view(), name="api_random_round"),
    path("api/round/submit", ApiSubmitRoundView.as_view(), name="api_submit_round"),

    # Results API
    path("api/my/results", ApiMyResultsView.as_view(), name="api_my_results"),
]
