import { jwtDecode } from 'jwt-decode';

export const auth = {
  // Al iniciar sesión, guardamos el token
  login(token) {
    localStorage.setItem("accessToken", token);
  },

  // Al cerrar sesión, limpiamos todo
  logout() {
    localStorage.removeItem("accessToken");
  },

  // Revisa si hay un token válido
  isLogged() {
    const token = localStorage.getItem("accessToken");
    return !!token;
  },

  // Decodifica el token para obtener la info del usuario
  getUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.user; // Devuelve el objeto { id, role }
      }
      return null;
    } catch (e) {
      console.error("Error al decodificar el token", e);
      return null;
    }
  },

  // Obtiene solo el ROL del usuario
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }
};