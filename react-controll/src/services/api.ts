// src/services/api.ts
import axios from "axios";

// definir el tipo de datos
export interface ApiData {
	id: string;
	index: number;
	data: unknown;
	// mas propiedades...
}

export const httpCLient = axios.create({
	baseURL:"http://localhost:3000/",
});