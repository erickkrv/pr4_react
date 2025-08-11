/**
 * Componente ListaLibros - Biblioteca Interactiva
 * 
 * Este componente renderiza una biblioteca interactiva con funcionalidades de:
 * - Búsqueda de libros por título o autor
 * - Filtrado por categorías/tecnologías
 * - Header sticky inteligente con detección de scroll
 * - Responsive design adaptado a todos los dispositivos
 * - Estado de "sin resultados" con sugerencias útiles
 */

import data from "../data/libros.json";
import { useState, useEffect } from "react";
import "../App.css";
import { SiJavascript, SiCss3, SiReact, SiHtml5, SiNodedotjs, SiTypescript } from 'react-icons/si';
import { FaBook } from 'react-icons/fa';

// Mapeo de nombres de categorías a componentes de iconos de react-icons
const categoryIcons = {
  'CSS': SiCss3,
  'JavaScript': SiJavascript,
  'React': SiReact,
  'HTML': SiHtml5,
  'Node.js': SiNodedotjs,
  'TypeScript': SiTypescript,
};

// Colores oficiales de cada tecnología para mantener consistencia con las marcas
const categoryColors = {
  'CSS': '#1572b6',      // Azul oficial de CSS3
  'JavaScript': '#f7df1e', // Amarillo oficial de JavaScript
  'React': '#61dafb',    // Cyan/azul oficial de React
  'HTML': '#e34c26',     // Naranja/rojo oficial de HTML5
  'Node.js': '#339933',  // Verde oficial de Node.js
  'TypeScript': '#3178c6', // Azul oficial de TypeScript
};

/**
 * Función que retorna el icono apropiado para cada categoría de tecnología
 * @param {string} categoryName - Nombre de la categoría
 * @param {number} size - Tamaño del icono en píxeles (por defecto 20)
 * @returns {JSX.Element} - Componente de icono con estilos aplicados
 */
const getCategoryIcon = (categoryName, size = 20) => {
  const IconComponent = categoryIcons[categoryName];
  const iconColor = categoryColors[categoryName];
  
  // Si existe un icono específico para la categoría, lo renderiza con su color
  return IconComponent ? (
    <IconComponent 
      size={size} 
      className={`category-icon category-${categoryName.toLowerCase().replace('.', '')}`}
      style={{ color: iconColor }}
      aria-label={`${categoryName} icon`}
    />
  ) : (
    // Icono por defecto (libro) si no se encuentra la categoría
    <FaBook 
      size={size} 
      className="category-icon default-icon"
      aria-label="Book icon"
    />
  );
};

/**
 * Hook personalizado para detectar la dirección del scroll
 * Permite mostrar/ocultar elementos basado en si el usuario hace scroll hacia arriba o abajo
 * 
 * @returns {string} - "up" o "down" dependiendo de la dirección del scroll
 */
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up");
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = prevScrollY > currentScrollY ? "up" : "down";
      
      // Solo actualiza si la diferencia es > 10px (evita problemas de sensibilidad)
      if (Math.abs(currentScrollY - prevScrollY) > 10) {
        setScrollDirection(direction);
        setPrevScrollY(currentScrollY);
      }
    };

    // Listener pasivo para mejor rendimiento
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  return scrollDirection;
};

/**
 * Hook personalizado para calcular el número mínimo de resultados necesarios
 * para activar el comportamiento sticky del header, basado en el tamaño de pantalla
 * 
 * Esta función inteligente evita que el header sticky se active cuando no hay
 * suficiente contenido para hacer scroll, mejorando la UX
 * 
 * @returns {number} - Número mínimo de resultados necesarios para activar sticky
 */
const useMinimumResultsForSticky = () => {
  const [minResults, setMinResults] = useState(3);

  useEffect(() => {
    const calculateMinResults = () => {
      const viewportHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      
      // Estima la altura de las tarjetas basado en el tamaño de pantalla
      let estimatedCardHeight;
      if (screenWidth >= 1200) {
        estimatedCardHeight = 280; // Pantallas grandes - más contenido por tarjeta
      } else if (screenWidth >= 768) {
        estimatedCardHeight = 260; // Tablet - contenido medio
      } else if (screenWidth >= 600) {
        estimatedCardHeight = 240; // Tablet pequeña
      } else {
        estimatedCardHeight = 220; // Mobile - tarjetas compactas
      }
      
      // Calcula tarjetas por fila basado en el sistema de grid
      let cardsPerRow;
      if (screenWidth >= 1200) {
        cardsPerRow = Math.floor((screenWidth - 100) / 270); // Cálculo aproximado del grid
      } else if (screenWidth >= 768) {
        cardsPerRow = Math.floor((screenWidth - 80) / 270);
      } else if (screenWidth >= 600) {
        cardsPerRow = Math.floor((screenWidth - 60) / 270);
      } else {
        cardsPerRow = 1; // Mobile siempre es una sola columna
      }
      
      // Toma en cuenta la altura del header (~200px) y márgenes
      const availableHeight = viewportHeight - 300;
      const rowsThatFitInViewport = Math.floor(availableHeight / estimatedCardHeight);
      
      // Necesitamos al menos 1.5 pantallas de contenido para que sticky tenga sentido
      const minCardsNeeded = Math.max(cardsPerRow * (rowsThatFitInViewport + 1), 3);
      
      setMinResults(minCardsNeeded);
    };

    calculateMinResults();
    // Recalcula en cambios de tamaño de ventana
    window.addEventListener("resize", calculateMinResults, { passive: true });
    
    return () => window.removeEventListener("resize", calculateMinResults);
  }, []);

  return minResults;
};

/**
 * Componente principal ListaLibros
 * Maneja toda la lógica de estado y renderizado de la biblioteca interactiva
 */
function ListaLibros() {
  // Datos de libros desde el archivo JSON
  const categorias = data.libros.categorias;
  
  // Obtiene el número mínimo de resultados para activar sticky
  const minResults = useMinimumResultsForSticky();

  // Estados del componente
  const [filtrosSeleccionados, setFiltrosSeleccionados] = useState(["Todos"]); // Filtros activos
  const [busqueda, setBusqueda] = useState(""); // Término de búsqueda
  const [isSticky, setIsSticky] = useState(false); // Estado del header sticky
  
  // Lista de todos los temas disponibles (incluye "Todos" + categorías del JSON)
  const temasDisponibles = ["Todos", ...categorias.map((cat) => cat.nombre)];

  /**
   * Maneja la lógica de toggle de filtros con comportamiento multi-select inteligente
   * - Si se selecciona "Todos", limpia los demás filtros
   * - Si se deseleccionan todos los filtros específicos, activa "Todos" automáticamente
   * - Permite selección múltiple de categorías específicas
   * 
   * @param {string} tema - El tema/categoría a alternar
   */
  const toggleFiltro = (tema) => {
    if (tema === "Todos") {
      // Si clickea "Todos", limpia todos los demás filtros
      setFiltrosSeleccionados(["Todos"]);
    } else {
      setFiltrosSeleccionados(prev => {
        // Remueve "Todos" de la lista actual
        const newFilters = prev.filter(f => f !== "Todos");
        
        if (newFilters.includes(tema)) {
          // Si el tema ya está seleccionado, lo remueve
          const filtered = newFilters.filter(f => f !== tema);
          // Si no quedan filtros, activa "Todos" por defecto
          return filtered.length === 0 ? ["Todos"] : filtered;
        } else {
          // Si el tema no está seleccionado, lo agrega
          return [...newFilters, tema];
        }
      });
    }
  };

  /**
   * Lógica de filtrado de libros en dos pasos:
   * 1. Filtra por categorías seleccionadas
   * 2. Filtra por término de búsqueda (título o autor)
   */
  const librosFiltrados = categorias
    // Paso 1: Filtrar por categorías seleccionadas
    .filter((cat) => 
      filtrosSeleccionados.includes("Todos") || 
      filtrosSeleccionados.includes(cat.nombre)
    )
    // Transforma la estructura de datos: de categorías con libros -> lista plana de libros
    .flatMap((cat) =>
      cat.libros.map((libro) => ({ ...libro, tema: cat.nombre }))
    )
    // Paso 2: Filtrar por búsqueda en título y autor (case-insensitive)
    .filter((libro) => {
        const q = busqueda.toLowerCase();
        return (
            libro.titulo.toLowerCase().includes(q) ||
            libro.autor.toLowerCase().includes(q)
        );
    });

  // Solo detecta la dirección del scroll cuando hay suficiente contenido
  const hasEnoughContent = librosFiltrados.length >= minResults;
  const scrollDirection = useScrollDirection();

  /**
   * Effect para manejar el comportamiento sticky del header
   * Solo se activa cuando hay suficientes resultados para justificar el scroll
   */
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Activa sticky solo si hay scroll (>100px) y suficiente contenido
      setIsSticky(scrollY > 100 && hasEnoughContent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasEnoughContent, minResults]);

  /**
   * Effect para resetear el estado sticky cuando no hay suficiente contenido
   * Evita que el header se quede "pegado" innecesariamente
   */
  useEffect(() => {
    if (!hasEnoughContent) {
      setIsSticky(false);
    }
  }, [hasEnoughContent]);

  return (
    <div>
      {/* Título principal de la biblioteca */}
      <h2>Biblioteca Interactiva</h2>
      
      {/* 
        Placeholder que evita el "layout jump" cuando el header se vuelve sticky
        Solo aparece cuando el header está en modo sticky
      */}
      {isSticky && hasEnoughContent && <div className="sticky-placeholder" />}
      
      {/* 
        Header de búsqueda y filtros con comportamiento sticky inteligente
        - Se vuelve sticky cuando hay suficiente contenido y scroll > 100px
        - Se oculta al hacer scroll hacia abajo, se muestra al hacer scroll hacia arriba
        - Solo se activa cuando hay suficientes resultados para justificar el scroll
      */}
      <div className={`searching-methods ${isSticky && hasEnoughContent ? 'sticky' : ''} ${isSticky && hasEnoughContent && scrollDirection === 'down' ? 'hidden' : ''}`}>
        
        {/* Sección de barra de búsqueda */}
        <div className="search-section">
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

        {/* Sección de filtros por categoría */}
        <div className="filters-section">
          <div className="filter-label">
            <span>Filtrar por:</span>
          </div>
          <div className="filter-buttons">
            {temasDisponibles.map((tema) => (
              <button
                key={tema}
                className={`filter-btn ${filtrosSeleccionados.includes(tema) ? 'active' : ''} ${tema === 'Todos' ? 'all-filter' : ''}`}
                onClick={() => toggleFiltro(tema)}
                aria-pressed={filtrosSeleccionados.includes(tema)}
              >
                {/* Icono especial para "Todos" o icono específico de la tecnología */}
                {tema === 'Todos' ? (
                  <span className="filter-icon">🔍</span>
                ) : (
                  getCategoryIcon(tema, 18)
                )}
                <span className="filter-text">{tema}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de libros con layout responsive */}
      <div className="lista-libros">
        {librosFiltrados.length > 0 ? (
          /* Renderizado de tarjetas de libros cuando hay resultados */
          librosFiltrados.map((libro, index) => (
            <div key={index} className="card-libro">
              
              {/* Badge de categoría con icono y fondo temático */}
              <div className="category-header">
                <div className={`category-badge category-${libro.tema.toLowerCase().replace('.js', 'nodejs')}`}>
                  {getCategoryIcon(libro.tema)}
                  <span className="category-name">{libro.tema}</span>
                </div>
              </div>
              
              {/* Información principal del libro */}
              <h3>{libro.titulo}</h3>
              <p>
                <strong>Autor:</strong> {libro.autor}
              </p>
              <p className="publication-info">
                <strong>Editorial:</strong> {libro.editorial} · <strong>Edición:</strong> {libro.edicion}
              </p>
              <p>
                <strong>Nivel:</strong> {libro.nivel}
              </p>
              <p className="description">
                {libro.porQue}
              </p>
              
              {/* Enlace al recurso externo con apertura en nueva pestaña */}
              <a
                href={libro.linkCompra}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver recurso
              </a>
            </div>
          ))
        ) : (
          /* Estado de "sin resultados" con sugerencias útiles y UX amigable */
          <div className="no-results">
            <div className="no-results-content">
              <div className="no-results-icon">📚</div>
              <h3>No se encontraron libros</h3>
              
              {/* Mensaje contextual basado en si hay búsqueda activa o solo filtros */}
              <p className="no-results-message">
                {busqueda.trim() !== "" ? (
                  <>No encontramos libros que coincidan con tu búsqueda</>
                ) : (
                  <>No hay libros disponibles para los filtros seleccionados</>
                )}
              </p>
              
              {/* Sugerencias para ayudar al usuario a encontrar resultados */}
              <div className="no-results-suggestions">
                <p className="suggestions-title">Intenta con:</p>
                <ul>
                  <li>Verificar la ortografía</li>
                  <li>Usar términos más generales</li>
                  <li>Seleccionar diferentes categorías</li>
                  <li>Limpiar todos los filtros</li>
                </ul>
                
                {/* Botón de acción rápida para limpiar filtros (solo si no está en "Todos") */}
                {!filtrosSeleccionados.includes("Todos") && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setFiltrosSeleccionados(["Todos"]);
                      setBusqueda("");
                    }}
                  >
                    Limpiar filtros y búsqueda
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ListaLibros;
