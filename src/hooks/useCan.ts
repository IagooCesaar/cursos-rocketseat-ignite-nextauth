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
    // verifica se usuário possui todas as permissões
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    })
    if (!hasAllPermissions) {
      return false;
    }
  }

  if(roles?.length > 0) {
    // verifica se usuário possui todas as permissões
    const hasAllRoles = roles.every(role => {
      return user.roles.includes(role);
    })
    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}