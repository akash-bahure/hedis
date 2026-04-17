from allauth.account.adapter import get_adapter


def allauth_settings(request):
    """Expose some settings from django-allauth in templates."""
    adapter = get_adapter()
    return {
        "ACCOUNT_ALLOW_REGISTRATION": adapter.is_open_for_signup(request),
    }
