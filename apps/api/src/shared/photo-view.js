export function userPhotoView(user) {
  if (!user) return user;
  const revision = user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt;
  return {
    ...user,
    fotoDePerfil: user.fotoDePerfil ? `/api/users/${encodeURIComponent(user.id)}/photo${revision ? `?v=${encodeURIComponent(revision)}` : ""}` : null,
  };
}

export function groupPhotoView(group) {
  if (!group) return group;
  const revision = group.updatedAt instanceof Date ? group.updatedAt.toISOString() : group.updatedAt;
  return {
    ...group,
    foto: group.foto ? `/api/groups/${encodeURIComponent(group.id)}/photo${revision ? `?v=${encodeURIComponent(revision)}` : ""}` : null,
    usuarios: group.usuarios?.map(row => ({ ...row, usuario: userPhotoView(row.usuario) })),
  };
}
