CREATE TABLE `conviteGrupo` (
  `id` VARCHAR(30) NOT NULL,
  `groupId` VARCHAR(30) NOT NULL,
  `codigo` CHAR(16) NOT NULL,
  `criadoPorId` VARCHAR(30) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `conviteGrupo_groupId_key`(`groupId`),
  UNIQUE INDEX `conviteGrupo_codigo_key`(`codigo`),
  INDEX `conviteGrupo_criadoPorId_idx`(`criadoPorId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `conviteGrupo` ADD CONSTRAINT `conviteGrupo_groupId_fkey`
  FOREIGN KEY (`groupId`) REFERENCES `grupo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `conviteGrupo` ADD CONSTRAINT `conviteGrupo_criadoPorId_fkey`
  FOREIGN KEY (`criadoPorId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
