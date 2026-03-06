import json
import re
import random

from django.http import HttpRequest, JsonResponse
from django.db import transaction
from django.utils import timezone
from django.views import View

from .auth import (
    create_session_token,
    get_session_times,
    hash_password,
    hash_session_token,
    verify_password,
    PBKDF2_ITERATIONS,
)
from .models import AppUser, AppUserMember, AuthSession, WordDataset, GameResult


# -----------------------------
# Helpers
# -----------------------------
def _normalize_phone(raw: str) -> str:
    return re.sub(r"\D+", "", (raw or "").strip())


def _get_bearer_token(request: HttpRequest) -> str | None:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None

    prefix = "Bearer "
    if not auth_header.startswith(prefix):
        return None

    token = auth_header[len(prefix):].strip()
    return token or None


def _get_session(request: HttpRequest) -> AuthSession | None:
    token = _get_bearer_token(request)
    if not token:
        return None

    token_hash = hash_session_token(token)
    return (
        AuthSession.objects.select_related("user", "member")
        .filter(token_hash=token_hash, revoked_at__isnull=True, expires_at__gt=timezone.now())
        .first()
    )


def _json_body(request: HttpRequest) -> dict:
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return {}


# -----------------------------
# Health
# -----------------------------
class HealthView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        return JsonResponse({"status": "ok"})


# -----------------------------
# Auth APIs
# -----------------------------
class ApiLoginView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        username_raw = (payload.get("username") or "").strip()
        password = (payload.get("password") or "").strip()

        if not username_raw or not password:
            return JsonResponse({"error": "Please enter username and password."}, status=400)

        members_qs = AppUserMember.objects.select_related("user").filter(user__is_active=True)

        if "@" in username_raw:
            members_qs = members_qs.filter(email__iexact=username_raw)
        else:
            phone = _normalize_phone(username_raw)
            if not phone:
                return JsonResponse({"error": "Please enter username and password."}, status=400)
            members_qs = members_qs.filter(phone=phone)

        members = list(members_qs)
        if not members:
            return JsonResponse({"error": "Invalid username or password."}, status=401)

        matched_user = None
        matched_member = None

        for member in members:
            user = member.user
            if verify_password(
                password,
                salt_b64=user.password_salt_b64,
                password_hash_b64=user.password_hash_b64,
                iterations=user.password_iterations,
            ):
                matched_user = user
                matched_member = member
                break

        if matched_user is None:
            return JsonResponse({"error": "Invalid username or password."}, status=401)

        raw_token = create_session_token()
        times = get_session_times()

        AuthSession.objects.create(
            user=matched_user,
            member=matched_member,
            token_hash=hash_session_token(raw_token),
            created_at=times.created_at,
            expires_at=times.expires_at,
        )

        return JsonResponse(
            {
                "token": raw_token,
                "expires_at": times.expires_at.isoformat(),
                "user": {"id": matched_user.id, "username": matched_user.username},
            }
        )


class ApiMeView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        session = _get_session(request)
        if session is None or not session.user.is_active:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        if session.member is None:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        return JsonResponse(
            {
                "user": {
                    "id": session.user.id,
                    "username": session.user.username,
                    "team_no": session.user.team_no,
                },
                "member": {
                    "id": session.member.id,
                    "member_id": session.member.member_id,
                    "name": session.member.name,
                    "email": session.member.email,
                    "phone": session.member.phone,
                },
            }
        )


class ApiRegisterView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)
        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip()
        phone_raw = (payload.get("phone") or "").strip()
        password = (payload.get("password") or "").strip()

        if not name or not password:
            return JsonResponse({"error": "Name and password are required."}, status=400)
        if not email and not phone_raw:
            return JsonResponse({"error": "Email or phone number is required."}, status=400)
        if len(password) < 4:
            return JsonResponse({"error": "Password must be at least 4 characters."}, status=400)

        phone = _normalize_phone(phone_raw) if phone_raw else ""

        # Check for duplicate email or phone
        if email and AppUserMember.objects.filter(email__iexact=email).exists():
            return JsonResponse({"error": "Email already registered."}, status=409)
        if phone and AppUserMember.objects.filter(phone=phone).exists():
            return JsonResponse({"error": "Phone already registered."}, status=409)

        salt_b64, password_hash_b64, iterations = hash_password(password, iterations=PBKDF2_ITERATIONS)

        with transaction.atomic():
            # Create a team-less user account
            username = email or phone
            user = AppUser.objects.create(
                username=username,
                email=email or None,
                phone=phone or None,
                password_salt_b64=salt_b64,
                password_hash_b64=password_hash_b64,
                password_iterations=iterations,
                is_active=True,
            )

            member = AppUserMember.objects.create(
                user=user,
                name=name,
                email=email or None,
                phone=phone or "0000000000",
            )

            raw_token = create_session_token()
            times = get_session_times()
            AuthSession.objects.create(
                user=user,
                member=member,
                token_hash=hash_session_token(raw_token),
                created_at=times.created_at,
                expires_at=times.expires_at,
            )

        return JsonResponse(
            {
                "token": raw_token,
                "expires_at": times.expires_at.isoformat(),
                "user": {"id": user.id, "username": user.username},
            },
            status=201,
        )


class ApiLogoutView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        session = _get_session(request)
        if session is None:
            return JsonResponse({"ok": True})

        session.revoked_at = timezone.now()
        session.save(update_fields=["revoked_at"])
        return JsonResponse({"ok": True})


# -----------------------------
# Odd One Out Game APIs
# -----------------------------
TIME_LIMIT = 30


def calculate_score(is_correct: bool, time_limit: int, time_taken: float):
    base = 1.0 if is_correct else 0.0
    saved = max(0.0, time_limit - float(time_taken))
    bonus = round(saved * 0.1, 2)
    return round(base + bonus, 2)


class ApiRandomRoundView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        row = WordDataset.objects.order_by("?").first()

        if not row:
            return JsonResponse({"message": "No dataset rows found"}, status=404)

        synonyms = [row.synonym1, row.synonym2, row.synonym3, row.synonym4]
        antonyms = [row.antonym1, row.antonym2, row.antonym3, row.antonym4]

        synonyms = [w for w in synonyms if w]
        antonyms = [w for w in antonyms if w]

        if len(synonyms) < 3 or len(antonyms) < 1:
            return JsonResponse({"message": "Not enough words in dataset row"}, status=400)

        chosen_synonyms = random.sample(synonyms, 3)
        odd_word = random.choice(antonyms)

        tiles = chosen_synonyms + [odd_word]
        random.shuffle(tiles)

        return JsonResponse(
            {
                "round_id": row.word_id,
                "anchor_word": row.anchor_word,
                "time_limit": TIME_LIMIT,
                "tiles": [{"text": t} for t in tiles],
            },
            status=200,
        )


class ApiSubmitRoundView(View):
    def post(self, request: HttpRequest) -> JsonResponse:
        payload = _json_body(request)

        round_id = payload.get("round_id")
        selected_text = payload.get("selected_text")
        time_taken = payload.get("time_taken")

        if not round_id or not selected_text or time_taken is None:
            return JsonResponse(
                {"message": "round_id, selected_text, time_taken are required"},
                status=400,
            )

        session = _get_session(request)
        if session is None or not session.user.is_active:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        player_id = session.user.id

        try:
            row = WordDataset.objects.get(word_id=round_id)
        except WordDataset.DoesNotExist:
            return JsonResponse({"message": "Round not found"}, status=404)

        antonyms = [row.antonym1, row.antonym2, row.antonym3, row.antonym4]
        antonyms = [w for w in antonyms if w]

        is_correct = selected_text in antonyms
        score_awarded = calculate_score(is_correct, TIME_LIMIT, float(time_taken))

        # save result
        try:
            now = timezone.now()
            GameResult.objects.create(
                game_id=1,
                game_name="Odd One Out",
                player_id=player_id,
                start_time=now,
                end_time=now,
                duration=float(time_taken),
                absolute_score=float(score_awarded),
                percentage_score=100.0 if is_correct else 0.0,
                game_session_data=json.dumps(
                    {
                        "round_id": round_id,
                        "anchor_word": row.anchor_word,
                        "selected_text": selected_text,
                        "is_correct": is_correct,
                        "score_awarded": score_awarded,
                        "time_taken": time_taken,
                    }
                ),
                words_played=1,
                created_at=now,
            )
        except Exception as e:
            print("❌ Error saving into gameresults:", str(e))

        return JsonResponse(
            {"is_correct": is_correct, "score_awarded": score_awarded},
            status=200,
        )


class ApiMyResultsView(View):
    def get(self, request: HttpRequest) -> JsonResponse:
        session = _get_session(request)
        if session is None or not session.user.is_active:
            return JsonResponse({"error": "Unauthorized"}, status=401)

        player_id = session.user.id

        results = (
            GameResult.objects
            .filter(player_id=player_id)
            .order_by("-result_id")[:20]
        )

        out = []
        for r in results:
            out.append(
                {
                    "result_id": r.result_id,
                    "absolute_score": float(r.absolute_score or 0),
                    "percentage_score": float(r.percentage_score or 0),
                    "duration": float(r.duration or 0),
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                }
            )

        return JsonResponse({"player_id": player_id, "results": out}, status=200)
