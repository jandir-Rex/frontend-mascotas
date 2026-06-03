import React, { useState, useEffect, useRef } from 'react';
import {
  PlusCircle, Search, User, Dog, Calendar, Tag, Users,
  Trash2, Edit3, CheckCircle, AlertCircle, Loader2, X, Save
} from 'lucide-react';

const API_BASE_URL = 'https://backend-mascotas-h3zn.onrender.com';

export default function App() {
  const [mascotas, setMascotas] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('mascotas');
  const [notificacion, setNotificacion] = useState({ show: false, mensaje: '', tipo: '' });
  const submitLock = useRef(false);

  const [nombreMascota, setNombreMascota] = useState('');
  const [especie, setEspecie] = useState('');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [duenoAsignado, setDuenoAsignado] = useState('');
  const [duenoId, setDuenoId] = useState('');
  const [foto, setFoto] = useState(null);
  const [searchDueno, setSearchDueno] = useState('');
  const [showDuenoDropdown, setShowDuenoDropdown] = useState(false);

  const [nombreDueno, setNombreDueno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');

  const [modalMascota, setModalMascota] = useState(false);
  const [editMascota, setEditMascota] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEspecie, setEditEspecie] = useState('');
  const [editRaza, setEditRaza] = useState('');
  const [editEdad, setEditEdad] = useState('');
  const [editDuenoId, setEditDuenoId] = useState('');
  const [editDuenoNombre, setEditDuenoNombre] = useState('');
  const [editSearchDueno, setEditSearchDueno] = useState('');
  const [editShowDropdown, setEditShowDropdown] = useState(false);
  const [editFoto, setEditFoto] = useState(null);
  const [guardandoMascota, setGuardandoMascota] = useState(false);

  const [modalDueno, setModalDueno] = useState(false);
  const [editDueno, setEditDueno] = useState(null);
  const [editNombreDueno, setEditNombreDueno] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [guardandoDueno, setGuardandoDueno] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rm, rd] = await Promise.all([
        fetch(`${API_BASE_URL}/core/mascotas/`),
        fetch(`${API_BASE_URL}/core/duenos/`)
      ]);
      setMascotas(await rm.json());
      setDuenos(await rd.json());
    } catch { mostrarAlerta('Error al conectar con el servidor', 'error'); }
    finally { setLoading(false); }
  };

  const mostrarAlerta = (mensaje, tipo) => {
    setNotificacion({ show: true, mensaje, tipo });
    setTimeout(() => setNotificacion({ show: false, mensaje: '', tipo: '' }), 4000);
  };

  const handleGuardarDueno = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!nombreDueno || !telefono) { mostrarAlerta('Nombre y Teléfono son obligatorios', 'error'); return; }
    submitLock.current = true; setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/core/duenos/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreDueno, telefono, email })
      });
      if (res.ok) { mostrarAlerta('Dueño registrado correctamente', 'success'); setNombreDueno(''); setTelefono(''); setEmail(''); fetchData(); }
      else { mostrarAlerta('Error al guardar el dueño', 'error'); }
    } catch { mostrarAlerta('Error de red', 'error'); }
    finally { setSubmitting(false); submitLock.current = false; }
  };

  const handleAbrirEditarDueno = (d) => {
    setEditDueno(d); setEditNombreDueno(d.nombre || '');
    setEditTelefono(d.telefono || ''); setEditEmail(d.email || '');
    setModalDueno(true);
  };

  const handleGuardarEditarDueno = async (e) => {
    e.preventDefault();
    if (guardandoDueno) return;
    if (!editNombreDueno || !editTelefono) { mostrarAlerta('Nombre y Teléfono son obligatorios', 'error'); return; }
    setGuardandoDueno(true);
    try {
      const res = await fetch(`${API_BASE_URL}/core/duenos/${editDueno.id}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombreDueno, telefono: editTelefono, email: editEmail })
      });
      if (res.ok) { mostrarAlerta('Dueño actualizado correctamente', 'success'); setModalDueno(false); setEditDueno(null); fetchData(); }
      else { mostrarAlerta('Error al actualizar el dueño', 'error'); }
    } catch { mostrarAlerta('Error de red', 'error'); }
    finally { setGuardandoDueno(false); }
  };

  const handleEliminarDueno = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este dueño?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/core/duenos/${id}/`, { method: 'DELETE' });
      if (res.ok) { mostrarAlerta('Dueño eliminado', 'success'); fetchData(); }
      else { mostrarAlerta('No se pudo eliminar — puede tener mascotas asignadas', 'error'); }
    } catch { mostrarAlerta('Error de red', 'error'); }
  };

  const handleGuardarMascota = async (e) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!nombreMascota || !especie || !duenoId) { mostrarAlerta('Nombre, Especie y Dueño son obligatorios', 'error'); return; }
    submitLock.current = true; setSubmitting(true);
    const fd = new FormData();
    fd.append('nombre', nombreMascota); fd.append('especie', especie);
    fd.append('raza', raza); fd.append('edad', edad); fd.append('dueno', duenoId);
    if (foto) fd.append('imagen', foto);
    try {
      const res = await fetch(`${API_BASE_URL}/core/mascotas/`, { method: 'POST', body: fd });
      if (res.ok) {
        mostrarAlerta('Mascota registrada con éxito!', 'success');
        setNombreMascota(''); setEspecie(''); setRaza(''); setEdad('');
        setDuenoAsignado(''); setDuenoId(''); setFoto(null);
        const fi = document.getElementById('foto-input'); if (fi) fi.value = '';
        fetchData();
      } else { mostrarAlerta('Error al guardar la mascota', 'error'); }
    } catch { mostrarAlerta('Error de red', 'error'); }
    finally { setSubmitting(false); submitLock.current = false; }
  };

  const handleAbrirEditarMascota = (m) => {
    setEditMascota(m); setEditNombre(m.nombre || ''); setEditEspecie(m.especie || '');
    setEditRaza(m.raza || ''); setEditEdad(m.edad || '');
    setEditDuenoId(m.dueno || ''); setEditDuenoNombre(m.dueno_nombre || '');
    setEditSearchDueno(''); setEditFoto(null); setModalMascota(true);
  };

  const handleGuardarEditarMascota = async (e) => {
    e.preventDefault();
    if (guardandoMascota) return;
    if (!editNombre || !editEspecie || !editDuenoId) { mostrarAlerta('Nombre, Especie y Dueño son obligatorios', 'error'); return; }
    setGuardandoMascota(true);
    const fd = new FormData();
    fd.append('nombre', editNombre); fd.append('especie', editEspecie);
    fd.append('raza', editRaza); fd.append('edad', editEdad); fd.append('dueno', editDuenoId);
    if (editFoto) fd.append('imagen', editFoto);
    try {
      const res = await fetch(`${API_BASE_URL}/core/mascotas/${editMascota.id}/`, { method: 'PATCH', body: fd });
      if (res.ok) { mostrarAlerta('Mascota actualizada correctamente', 'success'); setModalMascota(false); setEditMascota(null); fetchData(); }
      else { mostrarAlerta('Error al actualizar la mascota', 'error'); }
    } catch { mostrarAlerta('Error de red', 'error'); }
    finally { setGuardandoMascota(false); }
  };

  const handleEliminarMascota = async (id) => {
    if (!confirm('¿Seguro que deseas remover esta mascota?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/core/mascotas/${id}/`, { method: 'DELETE' });
      if (res.ok) { mostrarAlerta('Mascota removida', 'success'); fetchData(); }
    } catch { mostrarAlerta('Error de red', 'error'); }
  };

  const duenosFiltrados = duenos.filter(d => d.nombre.toLowerCase().includes(searchDueno.toLowerCase()));
  const duenosEditFiltrados = duenos.filter(d => d.nombre.toLowerCase().includes(editSearchDueno.toLowerCase()));

  const Modal = ({ titulo, onClose, children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2"><Edit3 className="h-5 w-5" /> {titulo}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-teal-700 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2 rounded-lg"><Dog className="h-6 w-6 text-teal-200" /></div>
            <h1 className="text-xl font-bold tracking-tight">VetSystem <span className="text-teal-200 font-light text-sm">Pro</span></h1>
          </div>
          <nav className="flex gap-2">
            <button onClick={() => setTab('duenos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'duenos' ? 'bg-teal-600 text-white shadow-sm' : 'text-teal-100 hover:bg-teal-600/50'}`}>
              <Users className="h-4 w-4" /> Dueños
            </button>
            <button onClick={() => setTab('mascotas')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${tab === 'mascotas' ? 'bg-teal-600 text-white shadow-sm' : 'text-teal-100 hover:bg-teal-600/50'}`}>
              <Dog className="h-4 w-4" /> Mascotas
            </button>
          </nav>
        </div>
      </header>

      {notificacion.show && (
        <div className="fixed top-20 right-4 z-50">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white font-medium ${notificacion.tipo === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {notificacion.tipo === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{notificacion.mensaje}</span>
          </div>
        </div>
      )}

      {modalMascota && editMascota && (
        <Modal titulo="Editar Mascota" onClose={() => setModalMascota(false)}>
          <form onSubmit={handleGuardarEditarMascota} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre</label>
              <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Especie</label>
                <input type="text" value={editEspecie} onChange={(e) => setEditEspecie(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Raza</label>
                <input type="text" value={editRaza} onChange={(e) => setEditRaza(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Edad (Años)</label>
              <input type="number" value={editEdad} onChange={(e) => setEditEdad(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Dueño</label>
              <div className="relative flex items-center">
                <input type="text" value={editDuenoNombre || editSearchDueno}
                  onChange={(e) => { setEditSearchDueno(e.target.value); setEditDuenoNombre(''); setEditDuenoId(''); setEditShowDropdown(true); }}
                  onFocus={() => setEditShowDropdown(true)} placeholder="Buscar dueño..."
                  className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                <Search className="h-4 w-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
              {editDuenoId && <p className="text-xs text-emerald-600 mt-1">✓ Dueño seleccionado (ID: {editDuenoId})</p>}
              {editShowDropdown && duenosEditFiltrados.length > 0 && (
                <div className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-50">
                  {duenosEditFiltrados.map(d => (
                    <div key={d.id} onClick={() => { setEditDuenoNombre(d.nombre); setEditDuenoId(d.id); setEditSearchDueno(''); setEditShowDropdown(false); }}
                      className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-sm flex justify-between items-center">
                      <span className="font-medium text-slate-700">{d.nombre}</span>
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{d.telefono}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nueva foto (opcional)</label>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setEditFoto(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-slate-200 p-1 rounded-xl" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalMascota(false)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button type="submit" disabled={guardandoMascota}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {guardandoMascota ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalDueno && editDueno && (
        <Modal titulo="Editar Dueño" onClose={() => setModalDueno(false)}>
          <form onSubmit={handleGuardarEditarDueno} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo</label>
              <input type="text" value={editNombreDueno} onChange={(e) => setEditNombreDueno(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Teléfono</label>
              <input type="text" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setModalDueno(false)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button type="submit" disabled={guardandoDueno}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {guardandoDueno ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
            <p className="text-slate-500 font-medium">Sincronizando con el servidor remoto...</p>
          </div>
        ) : tab === 'mascotas' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 border-b pb-2">
                <PlusCircle className="h-5 w-5 text-teal-600" /> Registrar Mascota
              </h2>
              <form onSubmit={handleGuardarMascota} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre</label>
                  <input type="text" value={nombreMascota} onChange={(e) => setNombreMascota(e.target.value)}
                    placeholder="Ej: Toby" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Especie</label>
                    <input type="text" value={especie} onChange={(e) => setEspecie(e.target.value)}
                      placeholder="Ej: Perro" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Raza</label>
                    <input type="text" value={raza} onChange={(e) => setRaza(e.target.value)}
                      placeholder="Ej: Boxer" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Edad (Años)</label>
                  <input type="number" value={edad} onChange={(e) => setEdad(e.target.value)}
                    placeholder="Ej: 3" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Dueño Asignado</label>
                  <div className="relative flex items-center">
                    <input type="text" value={duenoAsignado || searchDueno}
                      onChange={(e) => { setSearchDueno(e.target.value); setDuenoAsignado(''); setDuenoId(''); setShowDuenoDropdown(true); }}
                      onFocus={() => setShowDuenoDropdown(true)} placeholder="Escribe para buscar dueño..."
                      className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                    <Search className="h-4 w-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                  {duenoId && <p className="text-xs text-emerald-600 font-medium mt-1">✓ Dueño seleccionado (ID: {duenoId})</p>}
                  {showDuenoDropdown && (searchDueno || duenosFiltrados.length > 0) && (
                    <div className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-50">
                      {duenosFiltrados.length > 0 ? duenosFiltrados.map(d => (
                        <div key={d.id} onClick={() => { setDuenoAsignado(d.nombre); setDuenoId(d.id); setSearchDueno(''); setShowDuenoDropdown(false); }}
                          className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-sm flex justify-between items-center">
                          <span className="font-medium text-slate-700">{d.nombre}</span>
                          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Tél: {d.telefono}</span>
                        </div>
                      )) : <div className="p-3 text-xs text-slate-400 text-center">No hay coincidencias.</div>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Fotografía</label>
                  <input id="foto-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFoto(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer border border-slate-200 p-1 rounded-xl" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Mascota'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Dog className="h-5 w-5 text-teal-600" /> Pacientes Registrados
              </h2>
              {mascotas.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Dog className="h-10 w-10 stroke-1" /><p className="font-medium">No hay mascotas registradas todavía.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mascotas.map(m => {
                    const urlImagen = m.imagen || m.fotografia;
                    const urlFinal = urlImagen ? (urlImagen.startsWith('http') ? urlImagen : `${API_BASE_URL}${urlImagen}`) : '';
                    return (
                      <div key={m.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                        <div>
                          <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                            {urlFinal ? (
                              <img src={urlFinal} alt={m.nombre}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                                <Dog className="h-8 w-8 stroke-1" /><span className="text-xs">Sin foto</span>
                              </div>
                            )}
                            <span className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              {m.especie || 'Mascota'}
                            </span>
                          </div>
                          <div className="p-4 space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{m.nombre}</h3>
                            <div className="bg-slate-50 rounded-xl p-2.5 text-xs grid grid-cols-2 gap-2 text-slate-600">
                              <div className="flex items-center gap-1"><Tag className="h-3.5 w-3.5 text-slate-400" /><b>Raza:</b> {m.raza || 'Chusco'}</div>
                              <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /><b>Edad:</b> {m.edad ? `${m.edad} añ.` : 'N/A'}</div>
                            </div>
                            <div className="bg-teal-50/50 text-teal-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 font-medium">
                              <User className="h-3.5 w-3.5 text-teal-600" />
                              <span><b>Dueño:</b> {m.dueno_nombre || 'No asignado'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 pt-0 border-t border-slate-50 mt-2 flex justify-end gap-2 text-xs font-semibold">
                          <button onClick={() => handleAbrirEditarMascota(m)}
                            className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors">
                            <Edit3 className="h-3.5 w-3.5" /> Editar
                          </button>
                          <button onClick={() => handleEliminarMascota(m.id)}
                            className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" /> Remover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-900 border-b pb-2">
                <PlusCircle className="h-5 w-5 text-teal-600" /> Registrar Dueño
              </h2>
              <form onSubmit={handleGuardarDueno} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo</label>
                  <input type="text" value={nombreDueno} onChange={(e) => setNombreDueno(e.target.value)}
                    placeholder="Ej: Irving Chávez" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Número Telefónico</label>
                  <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: +51 987654321" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej: irving@correo.com" className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-sm" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar Dueño'}
                </button>
              </form>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <Users className="h-5 w-5 text-teal-600" /> Directorio General de Clientes
              </h2>
              {duenos.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Users className="h-10 w-10 stroke-1" /><p className="font-medium">No hay clientes agregados en la base de datos.</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                        <th className="p-4">ID</th><th className="p-4">Nombre</th>
                        <th className="p-4">Contacto</th><th className="p-4">Email</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100 text-slate-700">
                      {duenos.map(d => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-mono text-xs text-slate-400">#{d.id}</td>
                          <td className="p-4 font-bold text-slate-900">{d.nombre}</td>
                          <td className="p-4 font-medium">{d.telefono}</td>
                          <td className="p-4 text-slate-500">{d.email || '—'}</td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleAbrirEditarDueno(d)}
                                className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-1 transition-colors text-xs font-semibold">
                                <Edit3 className="h-3.5 w-3.5" /> Editar
                              </button>
                              <button onClick={() => handleEliminarDueno(d.id)}
                                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-colors text-xs font-semibold">
                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}