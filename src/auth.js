export const auth = {
  login(user){ localStorage.setItem("accessToken","demo"); localStorage.setItem("userName", user || "Usuario"); },
  logout(){ localStorage.removeItem("accessToken"); localStorage.removeItem("userName"); },
  isLogged(){ return !!localStorage.getItem("accessToken"); },
  user(){ return localStorage.getItem("userName") || "Usuario"; }
};
