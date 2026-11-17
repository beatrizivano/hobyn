-- CreateTable
CREATE TABLE `usuario` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `sobrenome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `hashSenha` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `fotoDePerfil` VARCHAR(2048) NULL,

    UNIQUE INDEX `usuario_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessao` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `refreshTokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `sessao_refreshTokenHash_key`(`refreshTokenHash`),
    INDEX `sessao_userId_revokedAt_idx`(`userId`, `revokedAt`),
    INDEX `sessao_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupo` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `descricao` TEXT NOT NULL,
    `modoPontuacao` ENUM('registro', 'tempo') NOT NULL,
    `limiteRegistrosPorDia` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `foto` VARCHAR(2048) NULL,
    `criadoPorId` VARCHAR(30) NOT NULL,
    `fechamentoProcessadoEm` DATETIME(3) NULL,

    INDEX `grupo_criadoPorId_idx`(`criadoPorId`),
    INDEX `grupo_endsAt_fechamentoProcessadoEm_idx`(`endsAt`, `fechamentoProcessadoEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarioGrupo` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `groupId` VARCHAR(30) NOT NULL,
    `papel` ENUM('admin', 'membro') NOT NULL DEFAULT 'membro',
    `entrouEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `saiuEm` DATETIME(3) NULL,

    INDEX `usuarioGrupo_userId_groupId_idx`(`userId`, `groupId`),
    INDEX `usuarioGrupo_groupId_saiuEm_papel_idx`(`groupId`, `saiuEm`, `papel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hobby` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hobby_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupoHobby` (
    `groupId` VARCHAR(30) NOT NULL,
    `hobbyId` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`groupId`, `hobbyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pontuacao` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `modo` ENUM('fixo', 'porTempo') NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `unidadeTempoMinutos` INTEGER NULL,

    UNIQUE INDEX `pontuacao_nome_modo_key`(`nome`, `modo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registro` (
    `id` VARCHAR(30) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `data` DATE NOT NULL,
    `duracaoMinutos` INTEGER NOT NULL,
    `foto` VARCHAR(2048) NOT NULL,
    `groupId` VARCHAR(30) NOT NULL,
    `hobbyId` VARCHAR(30) NOT NULL,
    `descricao` TEXT NOT NULL,
    `criadoPorId` VARCHAR(30) NOT NULL,

    INDEX `registro_groupId_data_idx`(`groupId`, `data`),
    INDEX `registro_hobbyId_idx`(`hobbyId`),
    INDEX `registro_criadoPorId_idx`(`criadoPorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registroUsuario` (
    `registroId` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,

    INDEX `registroUsuario_userId_registroId_idx`(`userId`, `registroId`),
    PRIMARY KEY (`registroId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logAtividades` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `groupId` VARCHAR(30) NOT NULL,
    `pontuacaoId` VARCHAR(30) NOT NULL,
    `pontosGanhos` INTEGER NOT NULL,
    `registroId` VARCHAR(30) NULL,
    `desafioId` VARCHAR(30) NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `logAtividades_groupId_userId_data_idx`(`groupId`, `userId`, `data`),
    INDEX `logAtividades_registroId_idx`(`registroId`),
    INDEX `logAtividades_desafioId_idx`(`desafioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desafio` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(150) NOT NULL,
    `descricao` TEXT NOT NULL,
    `tipo` ENUM('grupo', 'aleatorio') NOT NULL,
    `groupId` VARCHAR(30) NULL,
    `pontuacaoId` VARCHAR(30) NOT NULL,
    `expiraEm` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `desafio_groupId_tipo_idx`(`groupId`, `tipo`),
    INDEX `desafio_expiraEm_idx`(`expiraEm`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupoDesafio` (
    `groupId` VARCHAR(30) NOT NULL,
    `desafioId` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`groupId`, `desafioId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desafioConclusao` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `desafioId` VARCHAR(30) NOT NULL,
    `groupId` VARCHAR(30) NOT NULL,
    `concluidoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `desafioConclusao_groupId_concluidoEm_idx`(`groupId`, `concluidoEm`),
    UNIQUE INDEX `desafioConclusao_userId_desafioId_groupId_key`(`userId`, `desafioId`, `groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conquista` (
    `id` VARCHAR(30) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NOT NULL,

    UNIQUE INDEX `conquista_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criterioConquista` (
    `id` VARCHAR(30) NOT NULL,
    `conquistaId` VARCHAR(30) NOT NULL,
    `tipo` ENUM('contagem_registros', 'contagem_tempo', 'contagem_hobbies_distintos', 'contagem_cooperativos', 'streak_dias', 'contagem_grupos', 'contagem_grupos_criados', 'contagem_desafios', 'posicao_grupo', 'podio_encerramento_grupo', 'tempo_tela_streak') NOT NULL,
    `hobbyId` VARCHAR(30) NULL,
    `valor` INTEGER NOT NULL,

    INDEX `criterioConquista_conquistaId_tipo_idx`(`conquistaId`, `tipo`),
    INDEX `criterioConquista_hobbyId_idx`(`hobbyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarioConquista` (
    `userId` VARCHAR(30) NOT NULL,
    `conquistaId` VARCHAR(30) NOT NULL,
    `conquistadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`, `conquistaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streakUsuario` (
    `userId` VARCHAR(30) NOT NULL,
    `streakRecorde` INTEGER NOT NULL DEFAULT 0,
    `ultimoDiaComRegistro` DATE NOT NULL,

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `objetivoUsuario` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `tipo` ENUM('tempo_tela_maximo') NOT NULL,
    `valorMinutos` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `objetivoUsuario_userId_tipo_key`(`userId`, `tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registroTempoTela` (
    `id` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `data` DATE NOT NULL,
    `minutos` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `registroTempoTela_userId_data_key`(`userId`, `data`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessao` ADD CONSTRAINT `sessao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupo` ADD CONSTRAINT `grupo_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioGrupo` ADD CONSTRAINT `usuarioGrupo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioGrupo` ADD CONSTRAINT `usuarioGrupo_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupoHobby` ADD CONSTRAINT `grupoHobby_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupoHobby` ADD CONSTRAINT `grupoHobby_hobbyId_fkey` FOREIGN KEY (`hobbyId`) REFERENCES `hobby`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registro` ADD CONSTRAINT `registro_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registro` ADD CONSTRAINT `registro_hobbyId_fkey` FOREIGN KEY (`hobbyId`) REFERENCES `hobby`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registro` ADD CONSTRAINT `registro_criadoPorId_fkey` FOREIGN KEY (`criadoPorId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registroUsuario` ADD CONSTRAINT `registroUsuario_registroId_fkey` FOREIGN KEY (`registroId`) REFERENCES `registro`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registroUsuario` ADD CONSTRAINT `registroUsuario_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logAtividades` ADD CONSTRAINT `logAtividades_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logAtividades` ADD CONSTRAINT `logAtividades_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logAtividades` ADD CONSTRAINT `logAtividades_pontuacaoId_fkey` FOREIGN KEY (`pontuacaoId`) REFERENCES `pontuacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logAtividades` ADD CONSTRAINT `logAtividades_registroId_fkey` FOREIGN KEY (`registroId`) REFERENCES `registro`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logAtividades` ADD CONSTRAINT `logAtividades_desafioId_fkey` FOREIGN KEY (`desafioId`) REFERENCES `desafio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafio` ADD CONSTRAINT `desafio_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafio` ADD CONSTRAINT `desafio_pontuacaoId_fkey` FOREIGN KEY (`pontuacaoId`) REFERENCES `pontuacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupoDesafio` ADD CONSTRAINT `grupoDesafio_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupoDesafio` ADD CONSTRAINT `grupoDesafio_desafioId_fkey` FOREIGN KEY (`desafioId`) REFERENCES `desafio`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafioConclusao` ADD CONSTRAINT `desafioConclusao_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafioConclusao` ADD CONSTRAINT `desafioConclusao_desafioId_fkey` FOREIGN KEY (`desafioId`) REFERENCES `desafio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `desafioConclusao` ADD CONSTRAINT `desafioConclusao_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `criterioConquista` ADD CONSTRAINT `criterioConquista_conquistaId_fkey` FOREIGN KEY (`conquistaId`) REFERENCES `conquista`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `criterioConquista` ADD CONSTRAINT `criterioConquista_hobbyId_fkey` FOREIGN KEY (`hobbyId`) REFERENCES `hobby`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioConquista` ADD CONSTRAINT `usuarioConquista_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarioConquista` ADD CONSTRAINT `usuarioConquista_conquistaId_fkey` FOREIGN KEY (`conquistaId`) REFERENCES `conquista`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streakUsuario` ADD CONSTRAINT `streakUsuario_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `objetivoUsuario` ADD CONSTRAINT `objetivoUsuario_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registroTempoTela` ADD CONSTRAINT `registroTempoTela_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
