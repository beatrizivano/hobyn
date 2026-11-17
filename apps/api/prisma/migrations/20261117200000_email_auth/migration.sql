ALTER TABLE `usuario` ADD COLUMN `emailVerificadoEm` DATETIME(3) NULL;
UPDATE `usuario` SET `emailVerificadoEm` = CURRENT_TIMESTAMP(3) WHERE `emailVerificadoEm` IS NULL;

CREATE TABLE `tokenEmail` (
  `id` VARCHAR(30) NOT NULL,
  `userId` VARCHAR(30) NOT NULL,
  `tipo` ENUM('ativacao_conta', 'recuperacao_senha', 'alteracao_senha') NOT NULL,
  `tokenHash` CHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `consumedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `tokenEmail_tokenHash_key`(`tokenHash`),
  INDEX `tokenEmail_userId_tipo_consumedAt_idx`(`userId`, `tipo`, `consumedAt`),
  INDEX `tokenEmail_expiresAt_idx`(`expiresAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `tokenEmail` ADD CONSTRAINT `tokenEmail_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
