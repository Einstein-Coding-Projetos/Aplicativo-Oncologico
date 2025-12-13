from django.db import models

class RelatoCaso(models.Model):
    titulo = models.CharField(max_length=200)
    texto = models.TextField()

    ativo = models.BooleanField(default=True)
    ja_exibido = models.BooleanField(default=False)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo