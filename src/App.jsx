export default function AquariumAIDashboard() {
  const cameraData = [
    {
      id: 1,
      camera: 'Top Camera',
      disease: 'White Spot Disease',
      confidence: 82,
      status: 'Critical',
      image:
        'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      camera: 'Side Camera',
      disease: 'Fin Rot',
      confidence: 65,
      status: 'Warning',
      image:
        'https://images.pexels.com/photos/34721993/pexels-photo-34721993.jpeg',
    },
  ];

  const alerts = [
    {
      title: 'Critical Disease Detected',
      description: 'White Spot Disease detected with high confidence.',
      severity: 'Critical',
    },
    {
      title: 'Behavioral Anomaly',
      description: 'Fish movement appears slower than normal.',
      severity: 'Warning',
    },
  ];

  const history = [
    {
      date: '2026-05-07',
      disease: 'Velvet Disease',
      confidence: '71%',
      source: 'Camera Only',
      status: 'Resolved',
    },
    {
      date: '2026-05-06',
      disease: 'Fin Rot',
      confidence: '84%',
      source: 'Combined Analysis',
      status: 'Under Observation',
    },
    {
      date: '2026-05-05',
      disease: 'White Spot Disease',
      confidence: '88%',
      source: 'Combined Analysis',
      status: 'Critical',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-6 hidden lg:block">
        <h1 className="text-2xl font-bold mb-10 text-cyan-400">
          AquaAI Monitor
        </h1>

        <nav className="space-y-4">
          {[
            'Dashboard',
            'Camera Monitoring',
            'Disease Detection',
            'NLP Observation',
            'Fusion Analysis',
            'Alerts',
            'History',
          ].map((item) => (
            <div
              key={item}
              className="bg-slate-800 hover:bg-cyan-600 transition-all duration-300 cursor-pointer rounded-xl px-4 py-3"
            >
              {item}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-bold">Aquarium Disease Dashboard</h2>
            <p className="text-slate-400 mt-2">
              Multimodal Fish Disease Detection using Vision + NLP
            </p>
          </div>

          <div className="bg-cyan-500/20 border border-cyan-500 rounded-2xl px-6 py-3">
            <p className="text-cyan-300 font-semibold">
              System Status: Active
            </p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[
            {
              title: 'Overall fish Health',
              value: '78%',
              color: 'bg-green-500',
            },
            {
              title: 'Active Alerts',
              value: '03',
              color: 'bg-red-500',
            },
            {
              title: 'Cameras Online',
              value: '02',
              color: 'bg-cyan-500',
            },
            {
              title: 'AI Accuracy',
              value: '91%',
              color: 'bg-purple-500',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl hover:scale-105 transition-all duration-300"
            >
              <div className={`w-4 h-4 rounded-full ${card.color} mb-4`} />
              <h3 className="text-slate-400 text-sm">{card.title}</h3>
              <p className="text-4xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </section>

        {/* Camera Monitoring */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-cyan-300">
              Camera Monitoring
            </h2>
            <div className="text-slate-400 text-sm">
              Live AI Disease Analysis
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {cameraData.map((cam) => (
              <div
                key={cam.id}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl"
              >
                <img
                  src={cam.image}
                  alt={cam.camera}
                  className="w-full h-72 object-cover"
                />

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">{cam.camera}</h3>
                    <span
                      className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        cam.status === 'Critical'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {cam.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-slate-400">Detected Disease</p>
                      <h4 className="text-xl font-semibold text-cyan-300">
                        {cam.disease}
                      </h4>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Confidence</span>
                        <span>{cam.confidence}%</span>
                      </div>

                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-cyan-400 h-3 rounded-full"
                          style={{ width: `${cam.confidence}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-slate-400 text-sm pt-2">
                      Captured: 10:42 PM
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* NLP Input + Detection */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
          {/* NLP Form */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-5">
              User Observation (NLP Input)
            </h2>

            <div className="space-y-5">
              <textarea
                placeholder="Describe fish behavior or visible symptoms..."
                className="w-full h-40 bg-slate-900 border border-slate-700 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                defaultValue="Fish swimming slowly and showing white spots near fins."
              />

              <div className="border-2 border-dashed border-slate-600 rounded-2xl p-6 text-center text-slate-400">
                Upload Optional Fish Image
              </div>

              <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-2xl transition-all duration-300">
                Analyze Observation
              </button>
            </div>
          </div>

          {/* NLP Result */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-5">
              NLP Analysis Result
            </h2>

            <div className="space-y-5">
              <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
                <p className="text-slate-400 mb-2">Detected Symptoms</p>

                <div className="flex flex-wrap gap-3">
                  {['White Spots', 'Slow Swimming', 'Loss of Appetite'].map(
                    (item) => (
                      <span
                        key={item}
                        className="bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>NLP Match Confidence</span>
                  <span>86%</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-purple-400 h-3 rounded-full"
                    style={{ width: '86%' }}
                  />
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500 rounded-2xl p-5">
                <p className="text-purple-300 font-semibold">
                  NLP suggests strong similarity to White Spot Disease.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fusion Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-8 text-cyan-300">
              Multimodal Fusion Analysis
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Camera */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Camera Detection</h3>
                <p className="text-slate-400 mb-2">Disease</p>
                <p className="text-2xl font-semibold text-cyan-300 mb-4">
                  White Spot Disease
                </p>

                <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-cyan-400 h-3 rounded-full"
                    style={{ width: '68%' }}
                  />
                </div>
                <p className="text-right text-sm text-slate-400">68%</p>
              </div>

              {/* Fusion */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center text-slate-950 text-2xl font-bold animate-pulse">
                  AI
                </div>

                <p className="mt-4 text-slate-300 max-w-xs">
                  Combining camera predictions with NLP-based symptom analysis
                  to improve disease detection accuracy.
                </p>
              </div>

              {/* Final Result */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-4">Final Prediction</h3>
                <p className="text-slate-400 mb-2">Disease</p>
                <p className="text-2xl font-semibold text-green-300 mb-4">
                  White Spot Disease
                </p>

                <div className="w-full bg-slate-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-green-400 h-3 rounded-full"
                    style={{ width: '89%' }}
                  />
                </div>
                <p className="text-right text-sm text-slate-400">89%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Detection */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-5">
              Disease Details
            </h2>

            <div className="space-y-5">
              <div>
                <p className="text-slate-400">Disease Name</p>
                <h3 className="text-3xl font-bold">White Spot Disease</h3>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Description</p>
                <p className="text-slate-300 leading-relaxed">
                  White Spot Disease is a common parasitic infection in aquarium
                  fish characterized by visible white spots, stress behavior,
                  and reduced appetite.
                </p>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Recommended Actions</p>

                <ul className="space-y-2 text-slate-300 list-disc list-inside">
                  <li>Increase water temperature gradually</li>
                  <li>Isolate infected fish</li>
                  <li>Use anti-parasitic treatment</li>
                  <li>Maintain water quality</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-cyan-300 mb-5">
              Active Alerts
            </h2>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.title}
                  className="bg-slate-900 border border-slate-700 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{alert.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        alert.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-slate-400">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* History Table */}
        <section>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-cyan-300 mb-5">
              Detection History
            </h2>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Disease</th>
                  <th className="pb-4">Confidence</th>
                  <th className="pb-4">Source</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.date + item.disease}
                    className="border-b border-slate-800 hover:bg-white/5 transition-all"
                  >
                    <td className="py-4">{item.date}</td>
                    <td className="py-4">{item.disease}</td>
                    <td className="py-4">{item.confidence}</td>
                    <td className="py-4">{item.source}</td>
                    <td className="py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          item.status === 'Critical'
                            ? 'bg-red-500/20 text-red-300'
                            : item.status === 'Resolved'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
