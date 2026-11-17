/** Modelos de apresentação. Os services convertem os DTOs da API para estas telas.
 * Schemas de entrada e validações são compartilhados pelo pacote local `shared`.
 */

export type ModoPontuacao = 'registro' | 'tempo';

export interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  fotoDePerfil: string | null;
  createdAt: string;
}

export type Membro = Pick<Usuario, 'id' | 'nome' | 'sobrenome' | 'fotoDePerfil'> & { papel?: 'admin' | 'membro' };

export interface Hobby {
  id: string;
  nome: string;
}

export interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  foto: string | null;
  modoPontuacao: ModoPontuacao;
  limiteRegistrosPorDia: number | null;
  endsAt: string | null;
  /** Vazio = sem restrição (todo o catálogo + "Outro"). */
  hobbiesPermitidos: Hobby[];
  membros: Membro[];
  /** RF4/RF12 pedem convite por código, ainda sem campo no modelo. */
  codigoConvite: string | null;
  meuPapel?: 'admin' | 'membro';
}

export interface Registro {
  criadoPorId?: string;
  grupoEncerrado?: boolean;
  id: string;
  grupoId: string;
  hobby: Hobby;
  /** Dia em que a atividade aconteceu. */
  data: string;
  duracaoMinutos: number;
  foto: string | null;
  descricao: string;
  /** Mais de um autor = registro cooperativo. */
  autores: Membro[];
  /** Nulo enquanto a API não oferecer reações. */
  curtidas: number | null;
  createdAt: string;
}

export interface RankingEntry {
  usuario: Membro;
  pontuacao: number;
  colocacao: number;
}

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  conquistadoEm: string | null;
}

export interface DesafioSemanal {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'grupo' | 'aleatorio';
  hobby: Hobby | null;
  /** Só desafios aleatórios têm prazo (pressão de tempo). */
  expiraEm: string | null;
  progresso: { atual: number; meta: number } | null;
}

export type WeeklyChallengeState =
  | { state: 'active'; desafio: DesafioSemanal }
  | { state: 'choose'; opcoes: [DesafioSemanal, DesafioSemanal] };

export interface GrupoAnterior {
  grupoId: string;
  nome: string;
  colocacao: number;
  totalMembros: number;
  encerradoEm: string;
}

export interface PerfilStats {
  registros: number;
  minutos: number;
  desafiosConcluidos: number;
  pontosTotais: number;
  hobbiesPraticados: Hobby[];
  gruposAnteriores: GrupoAnterior[];
}

export interface NovoRegistroInput {
  grupoId: string;
  hobbyId: string;
  data: string;
  duracaoMinutos: number;
  foto: File;
  descricao: string;
  participanteIds: string[];
}

export interface NovoGrupoInput {
  nome: string;
  descricao: string;
  foto: File | null;
  hobbyIds: string[];
  modoPontuacao: ModoPontuacao;
  limiteRegistrosPorDia: number | null;
  endsAt: string | null;
}

export type RegistroFormInput = Omit<NovoRegistroInput, 'foto'> & { foto: File | null };
