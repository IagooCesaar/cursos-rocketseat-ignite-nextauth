import { useAuth } from "../contexts/AuthContext";

type useCanParams = {
  permissions?: string[];
  roles?: string[];
}
export function useCan({
  permissions,
  roles,
}: useCanParams) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return false;
  }

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