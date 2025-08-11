import data from "../data/libros.json";
import { useState } from "react";
import "../App.css";
import { SiJavascript, SiCss3, SiReact, SiHtml5, SiNodedotjs, SiTypescript } from 'react-icons/si';
import { FaBook } from 'react-icons/fa';

const categoryIcons = {
  'CSS': SiCss3,
  'JavaScript': SiJavascript,
  'React': SiReact,
  'HTML': SiHtml5,
  'Node.js': SiNodedotjs,
  'TypeScript': SiTypescript,
};

const categoryColors = {
  'CSS': '#1572b6',      // CSS3 official blue
  'JavaScript': '#f7df1e', // JavaScript yellow
  'React': '#61dafb',    // React cyan/blue
  'HTML': '#e34c26',     // HTML5 orange/red
  'Node.js': '#339933',  // Node.js green
  'TypeScript': '#3178c6', // TypeScript blue
};

const getCategoryIcon = (categoryName, size = 20) => {
  const IconComponent = categoryIcons[categoryName];
  const iconColor = categoryColors[categoryName];
  
  return IconComponent ? (
    <IconComponent 
      size={size} 
      className="category-icon"
      style={{ color: iconColor }}
      aria-label={`${categoryName} icon`}
    />
  ) : (
    <FaBook 
      size={size} 
      className="category-icon default-icon"
      aria-label="Book icon"
    />
  );
};

function ListaLibros() {
  const categorias = data.libros.categorias;

  const [filtro, setFiltro] = useState("Todos");

  const [busqueda, setBusqueda] = useState("");
  
  const temasDisponibles = ["Todos", ...categorias.map((cat) => cat.nombre)];

  const librosFiltrados = categorias
    .filter((cat) => filtro === "Todos" || cat.nombre === filtro)
    .flatMap((cat) =>
      cat.libros.map((libro) => ({ ...libro, tema: cat.nombre }))
    )
    /* Filtro para buscar libros */
    .filter((libro) => {
        const q = busqueda.toLowerCase();
        return (
            libro.titulo.toLowerCase().includes(q) ||
            libro.autor.toLowerCase().includes(q)
        );
    });

  return (
    <div>
      {/* Título de la sección */}
      <h2>Biblioteca Interactiva</h2>
      
      {/* Contenedor del filtro y barra de navegacion */}
      <div className="searching-methods">
        <label htmlFor="filtro-tema">Filtrar por tema:</label>

        {/* Agrega este div con clase filtro-container */}
        <div className="filtro-container">
          <select
            id="filtro-tema"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            {temasDisponibles.map((tema, i) => (
              <option key={i} value={tema}>
                {tema}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="search">
            <input
              className="search-input"
              type="search"
              placeholder="Título o Autor"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <span className="material-symbols-outlined"> search </span>
          </div>
        </form>
      </div>


      {/* Contenedor de tarjetas de libros */}
      <div className="lista-libros">
        {librosFiltrados.map((libro, index) => (
          <div key={index} className="card-libro">
            {/* Category header with icon */}
            <div className="category-header">
              {getCategoryIcon(libro.tema)}
              <span className="category-name">{libro.tema}</span>
            </div>
            
            {/* Datos del libro */}
            <h3>{libro.titulo}</h3>
            <p>
              <strong>Autor:</strong> {libro.autor}
            </p>
            <p>
              <strong>Editorial:</strong> {libro.editorial}
            </p>
            <p>
              <strong>Edición:</strong> {libro.edicion}
            </p>
            <p>
              <strong>Nivel:</strong> {libro.nivel}
            </p>
            <p>
              <strong>Tema:</strong> {libro.temas}
            </p>
            <p>
              <strong>¿Por qué leerlo?</strong> {libro.porQue}
            </p>
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
