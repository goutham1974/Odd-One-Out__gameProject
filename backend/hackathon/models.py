from django.db import models
from django.utils import timezone


class AppUser(models.Model):
    team_no = models.PositiveIntegerField(unique=True, null=True, blank=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=254, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=32, unique=True, null=True, blank=True)

    password_salt_b64 = models.CharField(max_length=64)
    password_hash_b64 = models.CharField(max_length=128)
    password_iterations = models.PositiveIntegerField()

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.username


class AppUserMember(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="members")
    member_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=254, null=True, blank=True)
    phone = models.CharField(max_length=32)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "phone"], name="uniq_member_phone_per_team"),
        ]
        indexes = [
            models.Index(fields=["user", "phone"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.username}:{self.phone}"


class AuthSession(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="sessions")
    member = models.ForeignKey(
        AppUserMember, on_delete=models.CASCADE, related_name="sessions", null=True, blank=True
    )
    token_hash = models.CharField(max_length=64, unique=True)

    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "expires_at"]),
            models.Index(fields=["member", "expires_at"]),
        ]

    def is_valid(self) -> bool:
        if self.revoked_at is not None:
            return False
        return self.expires_at > timezone.now()


# ✅ Dataset table (MySQL student DB)
class WordDataset(models.Model):
    word_id = models.AutoField(primary_key=True)
    anchor_word = models.CharField(max_length=255)

    synonym1 = models.CharField(max_length=255, null=True, blank=True)
    synonym2 = models.CharField(max_length=255, null=True, blank=True)
    synonym3 = models.CharField(max_length=255, null=True, blank=True)
    synonym4 = models.CharField(max_length=255, null=True, blank=True)

    antonym1 = models.CharField(max_length=255, null=True, blank=True)
    antonym2 = models.CharField(max_length=255, null=True, blank=True)
    antonym3 = models.CharField(max_length=255, null=True, blank=True)
    antonym4 = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "sortonym_words"
        managed = False

    def __str__(self):
        return self.anchor_word


# ✅ Game Results table (MySQL student DB)
class GameResult(models.Model):
    result_id = models.AutoField(primary_key=True)

    game_id = models.IntegerField(null=True, blank=True)
    game_name = models.CharField(max_length=255, null=True, blank=True)

    player_id = models.IntegerField(null=True, blank=True)

    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    duration = models.FloatField(null=True, blank=True)

    absolute_score = models.FloatField(null=True, blank=True)
    percentage_score = models.FloatField(null=True, blank=True)

    game_session_data = models.TextField(null=True, blank=True)

    words_played = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "gameresults"
        managed = False

    def __str__(self):
        return f"Result {self.result_id} - Player {self.player_id}"
