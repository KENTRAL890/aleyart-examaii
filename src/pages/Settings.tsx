import React, { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  School,
  Upload,
  Save,
  Image,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle,
} from 'lucide-react';

const Settings: React.FC = () => {
  const { schoolSettings, updateSchoolSettings } = useData();
  const { user, hasPermission } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: schoolSettings.name,
    motto: schoolSettings.motto,
    logo: schoolSettings.logo,
    address: schoolSettings.address,
    telephone: schoolSettings.telephone,
    email: schoolSettings.email,
    website: schoolSettings.website,
  });

  const [saved, setSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSchoolSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const canEdit = hasPermission('canManageUsers');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <SettingsIcon className="text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-500">Configure school information and system settings</p>
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={20} />
          Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Information */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <School className="text-blue-600" />
            School Information
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Motto</label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!canEdit}
              />
              <p className="text-xs text-gray-500 mt-1">
                This motto will appear on all documents, examination papers, and reports.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} />
                School Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                disabled={!canEdit}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone size={16} />
                  Telephone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+233 XX XXX XXXX"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="info@school.edu.gh"
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Globe size={16} />
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.school.edu.gh"
                disabled={!canEdit}
              />
            </div>

            {canEdit && (
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Save size={18} />
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Logo & Preview */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Image className="text-blue-600" />
              School Logo
            </h2>

            <div className="text-center">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="School Logo"
                  className="w-32 h-32 mx-auto rounded-lg object-contain border border-gray-200 bg-white p-2"
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <School className="text-gray-400" size={48} />
                </div>
              )}

              {canEdit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 mx-auto"
                  >
                    <Upload size={18} />
                    Upload Logo
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Document Header Preview</h3>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-center">
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Logo"
                    className="w-12 h-12 mx-auto mb-2 object-contain"
                  />
                )}
                <h4 className="font-bold">{formData.name}</h4>
                <p className="text-sm italic">"{formData.motto}"</p>
                {formData.address && (
                  <p className="text-xs text-gray-600 mt-1">{formData.address}</p>
                )}
                {(formData.telephone || formData.email) && (
                  <p className="text-xs text-gray-600">
                    {formData.telephone}
                    {formData.telephone && formData.email && ' • '}
                    {formData.email}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              This header will appear on all examination papers, marking schemes, and documents.
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current User</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user?.fullName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p className="font-medium capitalize">{user?.role.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Staff ID</p>
            <p className="font-medium">{user?.staffId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Application</p>
            <p className="font-bold text-lg">ALEYART EXAMAI PRO</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Version</p>
            <p className="font-bold text-lg">1.0.0</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Compliance</p>
            <p className="font-bold text-lg">GES • NaCCA • SBC • CCP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
