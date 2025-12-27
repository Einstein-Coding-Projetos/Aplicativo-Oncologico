from django.db import models

class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=200)
    subtitulo = models.CharField(max_length=300, blank=True)
    texto = models.TextField()

    ativo = models.BooleanField(default=True)
    exibido_em = models.DateField(null=True, blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
    