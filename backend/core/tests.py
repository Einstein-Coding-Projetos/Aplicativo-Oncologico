from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import Appointment, RelatoCaso, UserProfile


class AppointmentApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='paciente1', password='SenhaForte123!')
        self.other_user = User.objects.create_user(username='paciente2', password='SenhaForte123!')
        self.client.force_authenticate(user=self.user)

    def test_create_appointment_success(self):
        payload = {
            'profissional': 'Dra. Helena Martins',
            'date': '2026-03-01',
            'horario': '10:00',
        }
        response = self.client.post('/api/appointments/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Appointment.objects.count(), 1)
        self.assertEqual(Appointment.objects.first().user, self.user)
        self.assertEqual(response.data['horario'], '10:00')

    def test_create_appointment_accepts_and_normalizes_single_digit_hour(self):
        payload = {
            'profissional': 'Dra. Helena Martins',
            'date': '2026-03-01',
            'horario': '8:00',
        }

        response = self.client.post('/api/appointments/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['horario'], '08:00')

    def test_duplicate_slot_is_rejected(self):
        Appointment.objects.create(
            user=self.other_user,
            profissional='Dra. Helena Martins',
            date='2026-03-01',
            horario='10:00',
            status=Appointment.STATUS_SCHEDULED,
        )
        payload = {
            'profissional': 'Dra. Helena Martins',
            'date': '2026-03-01',
            'horario': '10:00',
        }

        response = self.client.post('/api/appointments/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(
            'horario' in response.data or 'non_field_errors' in response.data
        )

    def test_duplicate_slot_is_rejected_with_normalized_time_input(self):
        Appointment.objects.create(
            user=self.other_user,
            profissional='Dra. Helena Martins',
            date='2026-03-01',
            horario='08:00',
            status=Appointment.STATUS_SCHEDULED,
        )
        payload = {
            'profissional': 'Dra. Helena Martins',
            'date': '2026-03-01',
            'horario': '8:00',
        }

        response = self.client.post('/api/appointments/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_mark_completed_and_list_completed(self):
        appointment = Appointment.objects.create(
            user=self.user,
            profissional='Dra. Helena Martins',
            date='2026-03-02',
            horario='11:00',
            status=Appointment.STATUS_SCHEDULED,
        )

        mark_response = self.client.post(f'/api/appointments/{appointment.id}/mark_completed/')
        completed_response = self.client.get('/api/appointments/completed/')

        self.assertEqual(mark_response.status_code, status.HTTP_200_OK)
        self.assertEqual(completed_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(completed_response.data), 1)
        self.assertEqual(completed_response.data[0]['id'], appointment.id)

    def test_occupied_slots_returns_global_bookings(self):
        Appointment.objects.create(
            user=self.other_user,
            profissional='Dra. Helena Martins',
            date='2026-03-03',
            horario='08:00',
            status=Appointment.STATUS_SCHEDULED,
        )

        response = self.client.get('/api/appointments/occupied-slots/?profissional=Dra.%20Helena%20Martins')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['horario'], '08:00')

    def test_clear_completed_deletes_only_current_user_completed(self):
        Appointment.objects.create(
            user=self.user,
            profissional='Dra. Helena Martins',
            date='2026-03-05',
            horario='09:00',
            status=Appointment.STATUS_COMPLETED,
        )
        Appointment.objects.create(
            user=self.user,
            profissional='Dra. Helena Martins',
            date='2026-03-06',
            horario='10:00',
            status=Appointment.STATUS_SCHEDULED,
        )
        Appointment.objects.create(
            user=self.other_user,
            profissional='Dra. Helena Martins',
            date='2026-03-07',
            horario='11:00',
            status=Appointment.STATUS_COMPLETED,
        )

        response = self.client.delete('/api/appointments/clear-completed/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Appointment.objects.filter(user=self.user).count(), 1)
        self.assertEqual(Appointment.objects.filter(user=self.other_user).count(), 1)

    def test_pending_excludes_cancelled_appointments(self):
        pending_appointment = Appointment.objects.create(
            user=self.user,
            profissional='Dra. Helena Martins',
            date='2026-03-08',
            horario='09:00',
            status=Appointment.STATUS_PENDING,
        )
        Appointment.objects.create(
            user=self.user,
            profissional='Dra. Helena Martins',
            date='2026-03-08',
            horario='10:00',
            status=Appointment.STATUS_CANCELLED,
        )

        response = self.client.get('/api/appointments/pending/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned_ids = [item['id'] for item in response.data]
        self.assertIn(pending_appointment.id, returned_ids)
        self.assertEqual(len(response.data), 1)

    def test_occupied_slots_excludes_cancelled_appointments(self):
        Appointment.objects.create(
            user=self.other_user,
            profissional='Dra. Helena Martins',
            date='2026-03-09',
            horario='08:00',
            status=Appointment.STATUS_CANCELLED,
        )

        response = self.client.get('/api/appointments/occupied-slots/?profissional=Dra.%20Helena%20Martins')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_appointment_requires_user(self):
        with self.assertRaises(IntegrityError):
            Appointment.objects.create(
                user=None,
                profissional='Dra. Helena Martins',
                date='2026-03-10',
                horario='12:00',
                status=Appointment.STATUS_SCHEDULED,
            )


class UserProfileConstraintTests(APITestCase):
    def test_user_profile_rejects_non_positive_treatment_duration(self):
        user = User.objects.create_user(username='duracao_invalida', password='SenhaForte123!')
        with self.assertRaises(IntegrityError):
            UserProfile.objects.create(
                user=user,
                treatment_duration_days=-2,
            )


class RelatoEndpointsTests(APITestCase):
    def test_relato_do_dia_returns_404_when_empty(self):
        response = self.client.get('/api/relato-do-dia/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_relato_do_dia_returns_valid_payload(self):
        RelatoCaso.objects.create(
            titulo='Titulo',
            subtitulo='Subtitulo',
            conteudo='Conteudo',
        )

        response = self.client.get('/api/relato-do-dia/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        payload = response.json()
        self.assertEqual(payload['titulo'], 'Titulo')
        self.assertIn('data', payload)

    def test_relato_aleatorio_returns_404_when_empty(self):
        response = self.client.get('/api/relato-aleatorio/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
