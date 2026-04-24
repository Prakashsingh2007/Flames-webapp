from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import FlamesResult
from .serializers import (
    FlamesCalculateRequestSerializer,
    FlamesHistorySerializer,
    FlamesResultSerializer,
)
from .services.flames_logic import calculate_flames
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import traceback

@method_decorator(csrf_exempt, name='dispatch')
class FlamesView(APIView):
    def post(self, request):
        try:
            print("📥 Incoming data:", request.data)

            request_serializer = FlamesCalculateRequestSerializer(data=request.data)
            request_serializer.is_valid(raise_exception=True)

            print("✅ Validated data:", request_serializer.validated_data)

            result = calculate_flames(
                request_serializer.validated_data["name1"],
                request_serializer.validated_data["name2"],
            )

            print("🧠 Calculation result:", result)

            saved_result = FlamesResult.objects.create(
                name1=result["name1"],
                name2=result["name2"],
                cleaned_name1=result["cleaned_name1"],
                cleaned_name2=result["cleaned_name2"],
                remaining_count=result["remaining_count"],
                relationship=result["relationship"],
                user=request.user if hasattr(request, "user") and request.user.is_authenticated else None,
            )

            print("💾 Saved to DB:", saved_result.id)

            serialized_result = FlamesResultSerializer(saved_result)

            response_payload = {
                **result,
                "calculation_id": serialized_result.data["id"],
                "created_at": serialized_result.data["created_at"],
                "owned_by_authenticated_user": bool(saved_result.user_id),
            }

            return Response(response_payload, status=status.HTTP_200_OK)

        except Exception as e:
            print("🔥 ERROR OCCURRED:")
            print(str(e))
            traceback.print_exc()

            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class FlamesHistoryView(APIView):
    def get(self, request):
        limit_value = request.query_params.get("limit", "20")

        try:
            limit = max(1, min(int(limit_value), 100))
        except ValueError:
            return Response(
                {"error": "limit must be a valid integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = FlamesResult.objects.all().order_by("-created_at")[:limit]
        serializer = FlamesHistorySerializer(queryset, many=True)
        return Response(
            {
                "count": len(serializer.data),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
