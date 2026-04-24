export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombreUsuario: string;
  email: string;
  password: string;
  pais: string;
}

export interface ApiStatusResponse {
  status: 'success' | 'error' | 'ok' | 'no-session';
  message?: string;
  usuario?: string;
}

export interface Game {
  id: number;
  nombre: string;
  fecha: string;
  valoraciones: number;
  precio: number;
  genero?: string;
  etiqueta?: string | string[];
  idioma: string[];
  so: string[];
  descripcion?: string;
  desarrollador?: string;
  paisDesarrollador?: string;
}

export interface CartItem {
  IdVideojuego: number;
  nombre: string;
  Precio: number | string;
}

export interface ProfileGame {
  IdVideojuego: number;
  nombre: string;
  Precio: number | string;
  Genero?: string;
  FechaLanzamiento?: string;
  ValoracionPromedio?: number | string;
  Descripcion?: string;
  FechaAdicion?: string;
  FechaAgregado?: string;
}

export interface ProfileResponse {
  usuario: {
    NombreUsuario: string;
    Correo: string;
    Pais?: string;
  };
  videojuegosAdquiridos: ProfileGame[];
  deseados: ProfileGame[];
  seguidos: ProfileGame[];
  ignorados: ProfileGame[];
  error?: string;
}

export interface SessionResponse {
  status: 'ok' | 'no-session';
  usuario?: string;
}

export interface LibraryCheckResponse {
  enBiblioteca: boolean;
}
