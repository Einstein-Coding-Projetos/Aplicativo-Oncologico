import importlib
import os
from unittest.mock import patch

from django.test import SimpleTestCase


class SettingsContractTests(SimpleTestCase):
    def test_settings_fallback_db_port_defaults_to_5432(self):
        with patch.dict(os.environ, {
            'DATABASE_URL': '',
            'POSTGRES_DB': 'apponco_db',
            'POSTGRES_USER': 'apponco_user',
            'POSTGRES_PASSWORD': '',
            'POSTGRES_HOST': 'localhost',
        }, clear=True):
            import apponco_api.settings as settings_mod
            settings_mod = importlib.reload(settings_mod)
            self.assertEqual(settings_mod.DATABASES['default']['PORT'], '5432')

    def test_settings_prod_uses_same_env_naming_contract(self):
        with patch.dict(os.environ, {
            'DJANGO_SECRET_KEY': 'my-secret',
            'DJANGO_DEBUG': '1',
            'DJANGO_ALLOWED_HOSTS': 'a.com,b.com',
            'DATABASE_URL': '',
            'POSTGRES_DB': 'dbx',
            'POSTGRES_USER': 'ux',
            'POSTGRES_PASSWORD': 'px',
            'POSTGRES_HOST': 'hx',
            'POSTGRES_PORT': '5544',
        }, clear=False):
            import apponco_api.settings_prod as settings_prod_mod
            settings_prod_mod = importlib.reload(settings_prod_mod)

            self.assertEqual(settings_prod_mod.SECRET_KEY, 'my-secret')
            self.assertTrue(settings_prod_mod.DEBUG)
            self.assertEqual(settings_prod_mod.ALLOWED_HOSTS, ['a.com', 'b.com'])
            self.assertEqual(settings_prod_mod.DATABASES['default']['NAME'], 'dbx')
            self.assertEqual(settings_prod_mod.DATABASES['default']['PORT'], '5544')
