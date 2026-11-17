import { prisma } from '../src/clients/prisma.client.js';
import { env } from '../src/infra/env.js';

try {
  await prisma.$transaction(async (transaction) => {
    for (const nome of ['Leitura', 'Arte', 'Cozinhar', 'Atividade física', 'Outro']) {
      await transaction.hobby.upsert({ where: { nome }, create: { nome }, update: {} });
    }
    // Valores de desenvolvimento baseados no exemplo do modelo de dados.
    const scores = [
      { nome: 'registro_hobby', modo: 'fixo', valor: 5, unidadeTempoMinutos: null },
      { nome: 'registro_hobby', modo: 'porTempo', valor: 2, unidadeTempoMinutos: 30 },
    ];
    if (env.cooperativeMultiplier !== null) {
      scores.push({ nome: 'bonus_cooperativo', modo: 'fixo', valor: env.cooperativeMultiplier, unidadeTempoMinutos: null });
    }
    for (const score of scores) {
      await transaction.pontuacao.upsert({
        where: { nome_modo: { nome: score.nome, modo: score.modo } },
        create: score, update: {},
      });
    }
  });
  console.info('Seed concluido: catalogo e regras iniciais criados; dados existentes preservados.');
  if (env.cooperativeMultiplier === null) console.info('Bonus nao criado: configure BONUS_COOPERATIVO_MULTIPLICADOR antes do seed.');
} finally {
  await prisma.$disconnect();
}
