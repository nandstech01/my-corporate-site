"""
RAG API URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    path('search', views.hybrid_search, name='hybrid_search'),
    path('stats', views.get_statistics, name='get_statistics'),
    path('health', views.health_check, name='health_check'),
]

