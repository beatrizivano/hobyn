/**
 * Dados de exemplo para desenvolver as telas sem a API.
 * Os hooks em `src/hooks` são a única camada que lê este arquivo;
 * ao integrar com a API, só os hooks mudam.
 */
import type {
  Conquista,
  DesafioSemanal,
  Grupo,
  Hobby,
  Membro,
  PerfilStats,
  RankingEntry,
  Registro,
  Usuario,
} from '../types/domain';

const DAY = 86_400_000;
const daysFromNow = (days: number) => new Date(Date.now() + days * DAY).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();
const nextMonday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return d.toISOString();
};

const membro = (id: string, nome: string, sobrenome: string): Membro => ({ id, nome, sobrenome, fotoDePerfil: null });

export const usuarioAtual: Usuario = {
  id: 'u1',
  nome: 'Beatriz',
  sobrenome: 'Ivano',
  email: 'bia@exemplo.com',
  fotoDePerfil: null,
  createdAt: '2026-09-14T12:00:00.000Z',
};

const bia = membro('u1', 'Beatriz', 'Ivano');
const viktor = membro('u2', 'Viktor', 'Garbossi');
const marina = membro('u3', 'Marina', 'Souza');
const caio = membro('u4', 'Caio', 'Lima');
const lara = membro('u5', 'Lara', 'Dias');
const teo = membro('u6', 'Teo', 'Alves');
const nina = membro('u7', 'Nina', 'Costa');
const davi = membro('u8', 'Davi', 'Rocha');

export const hobbyCatalogo: Hobby[] = [
  { id: 'h1', nome: 'Leitura' },
  { id: 'h2', nome: 'Arte' },
  { id: 'h3', nome: 'Cozinhar' },
  { id: 'h4', nome: 'Atividade física' },
  { id: 'h5', nome: 'Outro' },
];
const [leitura, arte] = hobbyCatalogo;

export const grupos: Grupo[] = [
  {
    id: 'g1',
    nome: 'Leitores de sábado',
    descricao: 'Ler longe da tela e contar o que descobrimos.',
    foto: null,
    modoPontuacao: 'registro',
    limiteRegistrosPorDia: 2,
    endsAt: null,
    hobbiesPermitidos: [leitura],
    membros: [bia, viktor, marina, caio, lara],
    codigoConvite: 'LEIT-2026',
  },
  {
    id: 'g2',
    nome: 'Desenho livre',
    descricao: null,
    foto: null,
    modoPontuacao: 'tempo',
    limiteRegistrosPorDia: null,
    endsAt: daysFromNow(20),
    hobbiesPermitidos: [arte],
    membros: [bia, viktor, marina, caio, lara, teo, nina, davi],
    codigoConvite: 'ARTE-1020',
  },
  {
    id: 'g3',
    nome: 'Jardim do prédio',
    descricao: null,
    foto: null,
    modoPontuacao: 'registro',
    limiteRegistrosPorDia: 3,
    endsAt: null,
    hobbiesPermitidos: [],
    membros: [bia, teo, nina],
    codigoConvite: 'JARD-0003',
  },
];

export const registros: Registro[] = [
  {
    id: 'r1',
    grupoId: 'g1',
    hobby: leitura,
    data: hoursAgo(2),
    duracaoMinutos: 90,
    foto: null,
    descricao: 'Terminei o capítulo 8 no parque, com o celular guardado na mochila. Foi bom demais desligar um pouco.',
    autores: [viktor],
    curtidas: 3,
    createdAt: hoursAgo(2),
  },
  {
    id: 'r2',
    grupoId: 'g1',
    hobby: leitura,
    data: hoursAgo(26),
    duracaoMinutos: 45,
    foto: null,
    descricao: 'Meia hora de conto antes de dormir.',
    autores: [marina],
    curtidas: 1,
    createdAt: hoursAgo(26),
  },
  {
    id: 'r3',
    grupoId: 'g2',
    hobby: arte,
    data: hoursAgo(5),
    duracaoMinutos: 60,
    foto: null,
    descricao: 'Desenhamos juntos a vista da janela.',
    autores: [marina, caio],
    curtidas: 4,
    createdAt: hoursAgo(5),
  },
];

const ranked = (entries: Array<[Membro, number]>): RankingEntry[] =>
  entries.map(([usuario, pontuacao], i) => ({ usuario, pontuacao, colocacao: i + 1 }));

export const rankings: Record<string, RankingEntry[]> = {
  g1: ranked([[viktor, 320], [bia, 275], [marina, 240], [caio, 180], [lara, 95]]),
  g2: ranked([[marina, 410], [caio, 390], [bia, 300], [viktor, 280], [lara, 220], [teo, 150], [nina, 90], [davi, 40]]),
  g3: ranked([[teo, 120], [bia, 90], [nina, 60]]),
};

const conquista = (id: string, nome: string, descricao: string, conquistadoEm: string | null = null): Conquista => ({
  id,
  nome,
  descricao,
  conquistadoEm,
});

export const conquistas: Conquista[] = [
  conquista('c1', 'Líder', 'Crie um grupo.', '2026-09-15T12:00:00.000Z'),
  conquista('c2', 'Focado', 'Registre algo todos os dias por 7 dias seguidos.', '2026-09-30T12:00:00.000Z'),
  conquista('c3', 'Muito focado', 'Registre algo todos os dias por 30 dias seguidos.'),
  conquista('c4', 'De tudo um pouco', 'Tenha registros de 10 hobbies diferentes.'),
  conquista('c5', 'Chef', 'Registre 50 vezes o hobby Cozinhar.'),
  conquista('c6', 'Atleta', 'Registre 50 vezes o hobby Atividade física.'),
  conquista('c7', 'Leitor', 'Registre 50 vezes o hobby Leitura.', '2026-10-05T12:00:00.000Z'),
  conquista('c8', 'Artista', 'Registre 50 vezes o hobby Arte.'),
  conquista('c9', 'Amigo', 'Faça 5 registros em conjunto com outras pessoas.'),
  conquista('c10', 'N.1', 'Fique em primeiro lugar em um grupo.'),
  conquista('c11', 'Pódio', 'Termine entre os 3 primeiros quando um grupo com prazo se encerrar.'),
  conquista('c12', 'Concentrado', 'Fique dentro da sua meta de tempo de tela por 7 dias seguidos.'),
];

export const desafioDaSemana: DesafioSemanal = {
  id: 'd1',
  nome: 'Ler 3h longe da tela',
  descricao: 'Some 3 horas de leitura até o fim da semana.',
  tipo: 'aleatorio',
  hobby: leitura,
  expiraEm: nextMonday(),
  progresso: { atual: 80, meta: 180 },
};

export const perfilStats: PerfilStats = {
  registros: 42,
  minutos: 3660,
  desafiosConcluidos: 6,
  pontosTotais: 1240,
  hobbiesPraticados: [leitura, arte, hobbyCatalogo[3]],
  gruposAnteriores: [
    { grupoId: 'gx1', nome: 'Maratona de agosto', colocacao: 2, totalMembros: 8, encerradoEm: '2026-08-31T00:00:00.000Z' },
  ],
};

export const metaTelaMinutos: number | null = null;
