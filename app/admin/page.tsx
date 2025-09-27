export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panoramica</h1>
        <p className="text-gray-300">Dashboard &gt; Panoramica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#030E15] backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">
            Dipendenti Totali
          </h3>
          <p className="text-3xl font-bold text-pink-400">24</p>
        </div>
        <div className="bg-[#030E15] backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">
            Manager Attivi
          </h3>
          <p className="text-3xl font-bold text-blue-400">8</p>
        </div>
        <div className="bg-[#030E15] backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Turni Oggi</h3>
          <p className="text-3xl font-bold text-green-400">12</p>
        </div>
        <div className="bg-[#030E15] backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">
            Richieste Pendenti
          </h3>
          <p className="text-3xl font-bold text-yellow-400">5</p>
        </div>
      </div>
    </div>
  );
}
