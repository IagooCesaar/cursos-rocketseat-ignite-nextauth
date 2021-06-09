type User = {
  permissions: string[];
  roles: string[];
}

type ValidateUserPermissionParams = {
  user: User;
  permissions: string[];
  roles: string[];  
}
export function validateUserPermissions({
  user, permissions, roles
}: ValidateUserPermissionParams) {

  if(permissions?.length > 0) {
    // verifica se usuário possui todas as permissões necessárias
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    })

    if (!hasAllPermissions) {
      return false;
    }
  }

  if(roles?.length > 0) {
    // verifica se usuário possui um ou mais perfis necessários
    const hasSomeRoles = roles.some(role => {
      return user.roles.includes(role);
    })

    if (!hasSomeRoles) {
      return false;
    }
  }

  return true;
}