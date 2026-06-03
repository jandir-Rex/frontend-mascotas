import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Trash2, Edit3, Dog, User, Phone, Mail, 
  Layers, Tag, Calendar, Image, Users, CheckCircle, ListPlus, Search 
} from 'lucide-react';

// Si necesitas FormularioMascota, se importa directo desde src porque está al lado de App.jsx:
const API_URL = 'https://backend-mascotas-h3zn.onrender.com/api/';

export default function App() {
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  
  // 🔥 SOLUCIÓN 1: Cambiamos el estado inicial a 'duenos' para iniciar siempre registrando al dueño
  const [tab, setTab] = useState('duenos');

  // Formularios
  const [formDueno, setFormDueno] = useState({ nombre: '', telefono: '', correo: '' });
  const [formMascota, setFormMascota] = useState({ nombre: '', especie: '', raza: '', edad: '', dueno: '' });
  const [imagenFile, setImagenFile] = useState(null);
  const [editId, setEditId] = useState(null);

  // 🔍 Estados para el buscador de dueños en tiempo real
  const [busquedaDueno, setBusquedaDueno] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  useEffect(() => {
    fetchDuenos();
    fetchMascotas();
  }, []);

  const fetchDuenos = () => fetch(API_URL + 'duenos/').then(res => res.json()).then(data => setDuenos(data));
  const fetchMascotas = () => fetch(API_URL + 'mascotas/').then(res => res.json()).then(data => setMascotas(data));

  const handleSaveDueno = async (e) => {
    e.preventDefault();
    
    // Limpiamos posibles problemas de doble barra en la URL
    const baseClean = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const url = editId ? `${baseClean}/duenos/${editId}/` : `${baseClean}/duenos/`;
    const method = editId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDueno)
      });

      if (response.ok) {
        setFormDueno({ nombre: '', telefono: '', correo: '' });
        setEditId(null);
        fetchDuenos();
        alert("¡Dueño guardado correctamente en MySQL!");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error del servidor Django:", errorData);
        alert(`Django rechazó la solicitud: ${response.status} - Ver consola`);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      alert("No se pudo conectar con el servidor backend. ¿Está corriendo Django?");
    }
  };

  const handleSaveMascota = async (e) => {
    e.preventDefault();
    if (!formMascota.dueno) {
      alert("Por favor, busca y selecciona un dueño válido utilizando el buscador.");
      return;
    }

    const formData = new FormData();
    formData.append('nombre', formMascota.nombre);
    formData.append('especie', formMascota.especie);
    formData.append('raza', formMascota.raza);
    formData.append('edad', formMascota.edad);
    formData.append('dueno', formMascota.dueno);
    if (imagenFile) formData.append('imagen', imagenFile);

    const url = editId ? `${API_URL}mascotas/${editId}/` : `${API_URL}mascotas/`;
    const method = editId ? 'PATCH' : 'POST';

    await fetch(url, { method: method, body: formData });
    setFormMascota({ nombre: '', especie: '', raza: '', edad: '', dueno: '' });
    setBusquedaDueno(''); // Resetear el texto del buscador
    setImagenFile(null);
    setEditId(null);
    fetchMascotas();
  };

  const handleDelete = async (endpoint, id) => {
    if(confirm('¿Estás seguro de eliminar este registro?')) {
      await fetch(`${API_URL}${endpoint}/${id}/`, { method: 'DELETE' });
      endpoint === 'duenos' ? fetchDuenos() : fetchMascotas();
    }
  };

  // ⚡ FILTRADO EN TIEMPO REAL: Filtra los dueños según lo que digita el usuario
  const duenosFiltrados = duenos.filter(d => 
    d.nombre.toLowerCase().includes(busquedaDueno.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Navbar con gradiente premium */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Dog className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">VetSystem <span className="text-emerald-200 font-light text-xl">Pro</span></h1>
          </div>
          <nav className="flex bg-black/10 p-1.5 rounded-xl border border-white/10">
            {/* Mantuvimos tus dos pestañas pero interactúan fluidamente */}
            <button onClick={() => { setTab('duenos'); setEditId(null); }} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${tab === 'duenos' ? 'bg-white text-teal-700 shadow-sm' : 'hover:bg-white/10 text-white'}`}>
              <Users size={16} /> Dueños
            </button>
            <button onClick={() => { setTab('mascotas'); setEditId(null); }} className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${tab === 'mascotas' ? 'bg-white text-teal-700 shadow-sm' : 'hover:bg-white/10 text-white'}`}>
              <Dog size={16} /> Mascotas
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA FORMULARIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-700">
            {editId ? <Edit3 size={20}/> : <PlusCircle size={20}/>} {editId ? 'Editar' : 'Registrar'} {tab === 'mascotas' ? 'Mascota' : 'Dueño'}
          </h2>
          
          {tab === 'duenos' ? (
            <form onSubmit={handleSaveDueno} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: Carlos Mendoza" value={formDueno.nombre} onChange={e => setFormDueno({...formDueno, nombre: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: 987654321" value={formDueno.telefono} onChange={e => setFormDueno({...formDueno, telefono: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
                <input type="email" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="correo@ejemplo.com" value={formDueno.correo} onChange={e => setFormDueno({...formDueno, correo: e.target.value})} required />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">Guardar Dueño</button>
            </form>
          ) : (
            <form onSubmit={handleSaveMascota} className="space-y-4" encType="multipart/form-data">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Mascota</label>
                <input type="text" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: Toby" value={formMascota.nombre} onChange={e => setFormMascota({...formMascota, nombre: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Especie</label>
                  <input type="text" placeholder="Ej: Perro" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={formMascota.especie} onChange={e => setFormMascota({...formMascota, especie: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Raza</label>
                  <input type="text" placeholder="Ej: Boxer" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={formMascota.raza} onChange={e => setFormMascota({...formMascota, raza: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Edad (Años)</label>
                <input type="number" className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="Ej: 3" value={formMascota.edad} onChange={e => setFormMascota({...formMascota, edad: e.target.value})} required />
              </div>
              
              {/* 🚀 SOLUCIÓN 2: BUSCADOR DE DUEÑO EN TIEMPO REAL */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Dueño Asignado</label>
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    className="w-full border p-2 pr-8 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                    placeholder="Escribe para buscar dueño..." 
                    value={busquedaDueno}
                    onFocus={() => setMostrarDropdown(true)}
                    onChange={e => {
                      setBusquedaDueno(e.target.value);
                      setFormMascota({...formMascota, dueno: ''}); // Resetea ID seleccionado si vuelve a escribir
                      setMostrarDropdown(true);
                    }}
                    required={!formMascota.dueno}
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>

                {/* Dropdown flotante inteligente */}
                {mostrarDropdown && busquedaDueno && (
                  <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg max-h-40 overflow-y-auto shadow-lg mt-1 divide-y divide-slate-100">
                    {duenosFiltrados.length > 0 ? (
                      duenosFiltrados.map(d => (
                        <li 
                          key={d.id} 
                          onClick={() => {
                            setFormMascota({...formMascota, dueno: d.id});
                            setBusquedaDueno(d.nombre);
                            setMostrarDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-emerald-50 cursor-pointer text-sm flex justify-between items-center"
                        >
                          <span className="font-semibold text-slate-700">{d.nombre}</span>
                          <span className="text-xs text-slate-400">{d.correo}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-sm text-slate-400 italic">No hay resultados</li>
                    )}
                  </ul>
                )}

                {/* Confirmación visual de selección */}
                {formMascota.dueno && (
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Dueño seleccionado correctamente (ID: {formMascota.dueno})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fotografía</label>
                <input type="file" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={e => setImagenFile(e.target.files[0])} required={!editId} />
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">Guardar Mascota</button>
            </form>
          )}
        </div>

        {/* COLUMNA DE CONTENIDO (LISTADOS) */}
        <div className="lg:col-span-2 space-y-6">
          {tab === 'mascotas' ? (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <ListPlus className="text-teal-600 w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-700">Pacientes Registrados</h3>
              </div>
              
              {mascotas.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border text-center border-slate-200/60 text-slate-400 font-medium">
                  <Dog className="w-12 h-12 mx-auto mb-3 opacity-30" /> No hay mascotas registradas todavía.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {mascotas.map(m => (
                    <div key={m.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all group">
                      <div className="relative overflow-hidden h-48 bg-slate-100">
                        {/* 🚀 SOLUCIÓN 3: Inyección dinámica del host de Django para que las imágenes rendericen */}
                        <img 
                          src={m.imagen.startsWith('http') ? m.imagen : `http://localhost:8000${m.imagen}`} 
                          alt={m.nombre} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-emerald-800 text-xs px-3 py-1 rounded-full font-black uppercase shadow-sm tracking-wider flex items-center gap-1">
                          <Layers size={10} /> {m.especie}
                        </span>
                      </div>
                      <div className="p-5">
                        <h4 className="text-xl font-extrabold text-slate-800 mb-2">{m.nombre}</h4>
                        
                        <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Tag size={14} className="text-slate-400" /> <span><strong>Raza:</strong> {m.raza}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <Calendar size={14} className="text-slate-400" /> <span><strong>Edad:</strong> {m.edad} añ.</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs bg-teal-50 text-teal-800 font-semibold px-3 py-2 rounded-xl">
                          <User size={14} className="text-teal-600" /> 
                          <span><strong>Dueño:</strong> {m.dueno_nombre || 'Asignado'}</span>
                        </div>
                        
                        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                          <button onClick={() => { setEditId(m.id); setFormMascota(m); setBusquedaDueno(m.dueno_nombre || ''); }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit3 size={14}/> Editar
                          </button>
                          <button onClick={() => handleDelete('mascotas', m.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={14}/> Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Users className="text-teal-600 w-5 h-5" />
                <h3 className="text-lg font-bold text-slate-700">Directorio General de Clientes</h3>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Propietario</th>
                      <th className="p-4">Datos de Contacto</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {duenos.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                            {d.nombre.charAt(0)}
                          </div>
                          {d.nombre}
                        </td>
                        <td className="p-4 space-y-1 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400"/> <span className="font-medium">{d.telefono}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-slate-400"/> <span>{d.correo}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => { setEditId(d.id); setFormDueno(d); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Editar Dueño">
                              <Edit3 size={15}/>
                            </button>
                            <button onClick={() => handleDelete('duenos', d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Eliminar Dueño">
                              <Trash2 size={15}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}