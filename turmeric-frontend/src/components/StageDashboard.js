import React, { useState, useEffect } from 'react';
import { useStageAuth } from '../context/StageAuthContext';
import { User, Shield, ArrowRight, Plus, Eye, BarChart3, QrCode } from 'lucide-react';
import StageDataEntryForm from './StageDataEntryForm';
import ShopkeeperPackets from './ShopkeeperPackets';
import PacketQRModal from './PacketQRModal';
import { API } from '../config/api';

/* ── Inline QR Lookup Panel (for processing stage) ─────────────── */
function ProcessingQRLookup({ onBack }) {
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [packetIds, setPacketIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    API.getFarmers()
      .then(r => setFarmers(r.data.farmers || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedFarmer) {
      API.getBatchesForFarmer(selectedFarmer)
        .then(r => { setBatches(r.data.batches || []); setSelectedBatch(''); setPacketIds([]); })
        .catch(() => setBatches([]));
    } else {
      setBatches([]); setSelectedBatch(''); setPacketIds([]);
    }
  }, [selectedFarmer]);

  const handleFetch = async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      const r = await API.getPacketsByStage(selectedBatch, 'processing');
      setPacketIds(r.data.packetIds || []);
    } catch {
      setPacketIds([]);
    } finally {
      setLoading(false);
    }
  };

  const selectClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          ← Back to Dashboard
        </button>
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Packet QR Codes</h1>
          <p className="text-white/90 text-sm">Select a batch to view and print QR codes for all its packets</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Farmer</label>
            <select value={selectedFarmer} onChange={e => setSelectedFarmer(e.target.value)} className={selectClass}>
              <option value="">Select Farmer</option>
              {farmers.map(f => { const id = typeof f === 'string' ? f : String(f || ''); return <option key={id} value={id}>{id}</option>; })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
            <select value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setPacketIds([]); }} className={selectClass} disabled={!selectedFarmer}>
              <option value="">{!selectedFarmer ? 'Select farmer first' : 'Select Batch'}</option>
              {batches.map(b => <option key={b.batchId} value={b.batchId}>{b.batchId}</option>)}
            </select>
          </div>
          <button
            onClick={handleFetch}
            disabled={!selectedBatch || loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Loading...</> : <><QrCode size={18} />Fetch Packets</>}
          </button>

          {packetIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 font-semibold mb-2">{packetIds.length} packet{packetIds.length !== 1 ? 's' : ''} found in this batch</p>
              <ul className="text-sm font-mono text-blue-700 space-y-1 max-h-40 overflow-y-auto mb-3">
                {packetIds.map(id => <li key={id} className="truncate">• {id}</li>)}
              </ul>
              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <QrCode size={18} /> View QR Codes
              </button>
            </div>
          )}

          {packetIds.length === 0 && selectedBatch && !loading && (
            <p className="text-center text-gray-500 text-sm py-4">No packets found at processing stage for this batch.</p>
          )}
        </div>
      </div>

      {showModal && (
        <PacketQRModal
          packetIds={packetIds}
          baseUrl={window.location.origin}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

/* ── Main StageDashboard ─────────────────────────────────────────── */
const StageDashboard = () => {
  const { stageUser } = useStageAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const getStageInfo = (stage) => {
    const stageConfig = {
      farmer: {
        name: 'Farmer',
        color: 'green',
        description: 'Harvest and initial processing stage',
        features: ['Add harvest data', 'Record GPS coordinates', 'Track organic status', 'Manage batch information']
      },
      processing: {
        name: 'Processing',
        color: 'blue',
        description: 'Grinding and packaging stage',
        features: ['Record processing data', 'Track moisture content', 'Monitor curcumin levels', 'Manage packaging']
      },
      distributor: {
        name: 'Distributor',
        color: 'purple',
        description: 'Distribution and logistics stage',
        features: ['Track distribution', 'Record dispatch data', 'Monitor logistics', 'Manage inventory']
      },
      supplier: {
        name: 'Supplier',
        color: 'yellow',
        description: 'Supply chain management stage',
        features: ['Manage supplies', 'Track receipts', 'Monitor inventory', 'Coordinate logistics']
      },
      shopkeeper: {
        name: 'Shopkeeper',
        color: 'red',
        description: 'Retail and final sale stage',
        features: ['Record sales', 'Track inventory', 'Manage customer data', 'Monitor product status']
      }
    };
    return stageConfig[stage] || stageConfig.farmer;
  };

  const stageInfo = getStageInfo(stageUser?.stage);

  if (activeView === 'data-entry') {
    return <StageDataEntryForm onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'packets') {
    return <ShopkeeperPackets onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'qr-lookup') {
    return <ProcessingQRLookup onBack={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`bg-gradient-to-br from-${stageInfo.color}-600 to-${stageInfo.color}-700 p-4 rounded-xl`}>
              <User className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {stageInfo.name} Dashboard
              </h1>
              <p className="text-gray-600">{stageInfo.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <Shield className="text-green-600" size={20} />
            <div className="text-left">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-green-700">
                Authenticated
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className={`bg-gradient-to-r from-${stageInfo.color}-50 to-${stageInfo.color}-100 rounded-xl p-6 mb-8`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {stageUser?.username}!
          </h2>
          <p className="text-gray-700">
            You are logged in as a {stageInfo.name.toLowerCase()} in the turmeric supply chain. 
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stageInfo.features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white border-2 border-${stageInfo.color}-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group`}
            >
              <div className={`bg-${stageInfo.color}-100 p-3 rounded-lg w-12 h-12 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <ArrowRight className={`text-${stageInfo.color}-600`} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {feature}
              </h3>
              <p className="text-gray-600 text-sm">
              {feature.toLowerCase()} for your stage
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveView('data-entry')}
              className={`bg-gradient-to-r from-${stageInfo.color}-600 to-${stageInfo.color}-700 text-white py-3 px-6 rounded-lg font-medium hover:from-${stageInfo.color}-700 hover:to-${stageInfo.color}-800 transition-all duration-200 flex items-center gap-2`}
            >
              <Plus size={20} />
              Add New Data Entry
            </button>

            {stageUser?.stage === 'processing' && (
              <button
                onClick={() => setActiveView('qr-lookup')}
                className="bg-white border-2 border-blue-200 text-blue-700 py-3 px-6 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 flex items-center gap-2"
              >
                <QrCode size={20} />
                Packet QR Codes
              </button>
            )}

            {stageUser?.stage === 'shopkeeper' && (
              <button
                onClick={() => setActiveView('packets')}
                className="bg-white border-2 border-red-200 text-red-700 py-3 px-6 rounded-lg font-medium hover:bg-red-50 transition-all duration-200 flex items-center gap-2"
              >
                <BarChart3 size={20} />
                Packets Inventory
              </button>
            )}
          </div>
        </div>

        {/* Stage Information */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stage Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Username</p>
              <p className="text-lg font-medium text-gray-800">{stageUser?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Stage</p>
              <p className="text-lg font-medium text-gray-800">{stageInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-lg font-medium text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageDashboard;
