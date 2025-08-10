import data from '../data/libros.json';
import { useState } from 'react';
import "../App.css";

function ListaLibros() {
    const categorias = data.libros.categorias;

    const [filtro, setFiltro] = useState('todos');

    const temasDisponibles = ['todos', ...categorias.map(cat => cat.nombre)];

    const librosFiltrados = categorias
        .filter(cat => filtro === 'todos' || cat.nombre === filtro)
        .flatMap(cat => cat.libros.map(libro => ({ ...libro, tema: cat.nombre })));

    return (
        <div>
            {/* Título de la sección */}
            <h2>Biblioteca Interactiva</h2>
            {/* Filtro por tema */}
            <label htmlFor="filtro-tema">Filtrar por tema:</label>
            <select id="filtro-tema" value={filtro} onChange={e => setFiltro(e.target.value) /*Actualiza el estado 'filtro' al cambiar la selección */}>
                {temasDisponibles.map((tema, i) => (
                    <option key={i} value={tema}>
                        {tema}
                    </option>
                ))}
            </select>
            {/* Contenedor de tarjetas de libros */}
            <div className="lista-libros">
                {librosFiltrados.map((libro, index) => (
                    <div key={index} className="card-libro">
                        {/* Datos del libro */}
                        <h3>{libro.titulo}</h3>
                        <p><strong>Autor:</strong> {libro.autor}</p>
                        <p><strong>Editorial:</strong> {libro.editorial}</p>
                        <p><strong>Edición:</strong> {libro.edicion}</p>
                        <p><strong>Nivel:</strong> {libro.nivel}</p>
                        <p><strong>Tema:</strong> {libro.tema}</p>
                        <p><strong>¿Por qué leerlo?</strong> {libro.porQue}</p>
                        {/* Enlace al recurso externo */}
                        <a
                            href={libro.linkCompra}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Ver recurso
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default ListaLibros;
