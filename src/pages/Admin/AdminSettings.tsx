import React, { useEffect, useRef, useState } from 'react';
import { Settings, Bell, Shield, Database, Palette, Globe, Mail, Phone } from 'lucide-react';
import { settings as apiSettings, updateSettings } from '../../api/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.js';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    id: 0,
    hotelName: '',
    hotelAddress: '',
    hotelPhone: '',
    hotelEmail: '',
    currency: '',
    checkInTime: '',
    checkOutTime: '',
    taxRate: 0,
    bcc_emails: '',
    notifications: {
      emailBookings: false,
      emailCancellations: false,
      emailPayments: false,
      pushNotifications: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'basic',
    },
    integrations: {
      smtp: {
        MAIL_HOST: '',
        MAIL_PORT: '',
        MAIL_USERNAME: '',
        MAIL_PASSWORD: '',
        MAIL_FROM_ADDRESS: '',
        MAIL_FROM_NAME: '',
      }
    }
  });

  const { loading, setLoading, fetchInfo } = useAuth();
  const settingsRef = useRef(null);

  const [showSMTPSetting, setShowSMTPSetting] = useState(false);

  useEffect(() => {
    if(!settingsRef.current){
      settingsRef.current = true;
      fetchSettings();
    }
  },[]);

  const fetchSettings = async () => {
      
    setLoading(true);
    try {
      const { data } = await apiSettings();
      setSettings({
        id: data.id,
        hotelName: data.hotel_name,
        hotelAddress: data.hotel_address,
        hotelPhone: data.phone,
        hotelEmail: data.email,
        currency: data.currency,
        checkInTime: data.check_in,
        checkOutTime: data.check_out,
        taxRate: data.tax_rate,
        bcc_emails: data.bcc_emails,
        notifications: {
          emailBookings: data.notify_new_booking,
          emailCancellations: data.notify_booking_cancellation,
          emailPayments: data.notify_booking_payment_confirmation,
          pushNotifications: data.enable_push_notification,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: data.session_timeout,
          passwordPolicy: data.password_policy,
        },
        integrations: {
          smtp: {
            MAIL_HOST: data.smtp.MAIL_HOST,
            MAIL_PORT: data.smtp.MAIL_PORT,
            MAIL_USERNAME: data.smtp.MAIL_USERNAME,
            MAIL_PASSWORD: data.smtp.MAIL_PASSWORD,
            MAIL_FROM_ADDRESS: data.smtp.MAIL_FROM_ADDRESS,
            MAIL_FROM_NAME: data.smtp.MAIL_FROM_NAME,
          }
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {

    setLoading(true);

    try{
      const { data } = await updateSettings(settings.id, {
        hotel_name: settings.hotelName,
        currency: settings.currency,
        hotel_address: settings.hotelAddress,
        phone: settings.hotelPhone,
        email: settings.hotelEmail,
        check_in: settings.checkInTime,
        check_out: settings.checkOutTime,
        tax_rate: settings.taxRate,
        bcc_emails: settings.bcc_emails,
        notify_new_booking: settings.notifications.emailBookings,
        notify_booking_cancellation: settings.notifications.emailCancellations,
        notify_booking_payment_confirmation: settings.notifications.emailPayments,
        enable_push_notification: settings.notifications.pushNotifications,
        session_timeout: settings.security.sessionTimeout,
        password_policy: settings.security.passwordPolicy,
        smtp: {
          MAIL_HOST: settings.integrations.smtp.MAIL_HOST,
          MAIL_PORT: settings.integrations.smtp.MAIL_PORT,
          MAIL_USERNAME: settings.integrations.smtp.MAIL_USERNAME,
          MAIL_PASSWORD: settings.integrations.smtp.MAIL_PASSWORD,
          MAIL_FROM_ADDRESS: settings.integrations.smtp.MAIL_FROM_ADDRESS,
          MAIL_FROM_NAME: settings.integrations.smtp.MAIL_FROM_NAME,
        },
      });

      setSettings({
        id: data.settings.id,
        hotelName: data.settings.hotel_name,
        hotelAddress: data.settings.hotel_address,
        hotelPhone: data.settings.phone,
        hotelEmail: data.settings.email,
        currency: data.settings.currency,
        checkInTime: data.settings.check_in,
        checkOutTime: data.settings.check_out,
        taxRate: data.settings.tax_rate,
        bcc_emails: data.bcc_emails,
        notifications: {
          emailBookings: data.settings.notify_new_booking,
          emailCancellations: data.settings.notify_booking_cancellation,
          emailPayments: data.settings.notify_booking_payment_confirmation,
          pushNotifications: data.settings.enable_push_notification,
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: data.settings.session_timeout,
          passwordPolicy: data.settings.password_policy,
        },
        integrations: {
          smtp: {
            MAIL_HOST: data.settings.smtp.MAIL_HOST,
            MAIL_PORT: data.settings.smtp.MAIL_PORT,
            MAIL_USERNAME: data.settings.smtp.MAIL_USERNAME,
            MAIL_PASSWORD: data.settings.smtp.MAIL_PASSWORD,
            MAIL_FROM_ADDRESS: data.settings.smtp.MAIL_FROM_ADDRESS,
            MAIL_FROM_NAME: data.settings.smtp.MAIL_FROM_NAME,
          }
        }
      });

      toast.success(data?.message || 'Settings saved successfully');

      fetchInfo();
    }catch(error){
      toast.error(error?.response?.data?.message || 'Failed to update settings!');
    }finally{
      setLoading(false);
    }

  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-gray-900 text-3xl">Settings</h1>
        <p className="text-gray-600">Manage your hotel configuration and preferences</p>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-gray-200 border-b overflow-x-auto">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#008ea2] text-[#008ea2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Hotel Information</h3>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Hotel Name
                    </label>
                    <input
                      type="text"
                      value={settings.hotelName}
                      onChange={(e) => setSettings({...settings, hotelName: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    >
                      <option value="PHP">PHP - Philippine Peso</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    Hotel Address
                  </label>
                  <textarea
                    value={settings.hotelAddress}
                    onChange={(e) => setSettings({...settings, hotelAddress: e.target.value})}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    rows={3}
                  />
                </div>
                
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mt-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.hotelPhone}
                      onChange={(e) => setSettings({...settings, hotelPhone: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.hotelEmail}
                      onChange={(e) => setSettings({...settings, hotelEmail: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-4 font-medium text-gray-900 text-lg">BCC Emails (separate it by comma)</h3>
                  <input
                    type="text"
                    placeholder="my_email.com1, my_email.com2, ..."
                    value={settings.bcc_emails}
                    onChange={(e) => setSettings({...settings, bcc_emails: e.target.value})}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Check-in/Check-out Times</h3>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      value={settings.checkInTime}
                      onChange={(e) => setSettings({...settings, checkInTime: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Check-out Time
                    </label>
                    <input
                      type="time"
                      value={settings.checkOutTime}
                      onChange={(e) => setSettings({...settings, checkOutTime: e.target.value})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.taxRate}
                      onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Email Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailBookings}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, emailBookings: e.target.checked}
                      })}
                      className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    />
                    <span className="ml-3 text-gray-900 text-sm">New booking notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailCancellations}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, emailCancellations: e.target.checked}
                      })}
                      className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    />
                    <span className="ml-3 text-gray-900 text-sm">Booking cancellation notifications</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailPayments}
                      onChange={(e) => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, emailPayments: e.target.checked}
                      })}
                      className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    />
                    <span className="ml-3 text-gray-900 text-sm">Payment confirmation notifications</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Push Notifications</h3>
                <label className="flex items-center opacity-75 cursor-not-allowed">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {...settings.notifications, pushNotifications: e.target.checked}
                    })}
                    className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    disabled={true}
                  />
                  <span className="ml-3 text-gray-900 text-sm">Enable push notifications</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Security Settings</h3>
                <div className="space-y-4">
                  <label className="hidden justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Two-Factor Authentication</span>
                      <p className="text-gray-500 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {...settings.security, twoFactorAuth: e.target.checked}
                      })}
                      className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    />
                  </label>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {...settings.security, sessionTimeout: Number(e.target.value)}
                      })}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Password Policy
                    </label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {...settings.security, passwordPolicy: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    >
                      <option value="basic">Basic (8+ characters)</option>
                      <option value="strong">Strong (8+ chars, numbers, symbols)</option>
                      <option value="very_strong">Very Strong (12+ chars, mixed case, numbers, symbols)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 font-medium text-gray-900 text-lg">Third-party Integrations</h3>
                <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex justify-center items-center bg-blue-100 rounded-lg w-10 h-10">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Email Service</h4>
                          <p className="text-gray-500 text-sm">SMTP Configuration</p>
                        </div>
                      </div>
                      <button onClick={(e) => setShowSMTPSetting(true)} className="font-medium text-[#008ea2] text-sm hover:underline">
                        Configure
                      </button>
                    </div>
                  </div>

                  <div className="opacity-50 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex justify-center items-center bg-green-100 rounded-lg w-10 h-10">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">SMS Service</h4>
                          <p className="text-gray-500 text-sm">Text message notifications</p>
                        </div>
                      </div>
                      <button className="font-medium text-[#008ea2] text-sm hover:underline">
                        Configure
                      </button>
                    </div>
                  </div>

                  <div className="opacity-50 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex justify-center items-center bg-purple-100 rounded-lg w-10 h-10">
                          <Database className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Payment Gateway</h4>
                          <p className="text-gray-500 text-sm">Stripe, PayPal integration</p>
                        </div>
                      </div>
                      <button className="font-medium text-[#008ea2] text-sm hover:underline">
                        Configure
                      </button>
                    </div>
                  </div>

                  <div className="opacity-50 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex justify-center items-center bg-orange-100 rounded-lg w-10 h-10">
                          <Globe className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Booking Channels</h4>
                          <p className="text-gray-500 text-sm">HelCris Hotel - API Provider, etc.</p>
                        </div>
                      </div>
                      <button className="font-medium text-[#008ea2] text-sm hover:underline">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`bg-[#008ea2] hover:bg-[#006b7a] px-6 py-2 rounded-lg font-medium text-white transition-colors ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Settings'}
        </button>
      </div>

      {showSMTPSetting && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">Mail Service (SMTP)</h2>
            
            <div className="space-y-4">
              <div className="gap-x-4 gap-y-6 grid grid-cols-1 sm:grid-cols-2">
                <div className="w-full">
                  <label htmlFor="MAIL_HOST" className="block mb-2 font-medium text-gray-700 text-xs">
                  MAIL HOST
                  </label>
                  <input
                  type="text"
                  id="MAIL_HOST"
                  name="MAIL_HOST"
                  value={settings?.integrations?.smtp?.MAIL_HOST || ''}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_HOST:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="MAILER HOST"
                  />
                </div>
                
                <div className="w-full">
                  <label htmlFor="MAIL_PORT" className="block mb-2 font-medium text-gray-700 text-xs">
                  MAIL PORT
                  </label>
                  <input
                  type="number"
                  id="MAIL_PORT"
                  name="MAIL_PORT"
                  value={settings?.integrations?.smtp?.MAIL_PORT || 0}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_PORT:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="PORT"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="MAIL_USERNAME" className="block mb-2 font-medium text-gray-700 text-xs">
                  MAIL USERNAME
                  </label>
                  <input
                  type="text"
                  id="MAIL_USERNAME"
                  name="MAIL_USERNAME"
                  value={settings?.integrations?.smtp?.MAIL_USERNAME || ''}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_USERNAME:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="USERNAME"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="MAIL_PASSWORD" className="block mb-2 font-medium text-gray-700 text-xs">
                  PASSWORD
                  </label>
                  <input
                  type="password"
                  id="MAIL_PASSWORD"
                  name="MAIL_PASSWORD"
                  value={settings?.integrations?.smtp?.MAIL_PASSWORD || ''}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_PASSWORD:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="PASSWORD"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="MAIL_FROM_ADDRESS" className="block mb-2 font-medium text-gray-700 text-xs">
                  MAIL FROM ADDRESS
                  </label>
                  <input
                  type="text"
                  id="MAIL_FROM_ADDRESS"
                  name="MAIL_FROM_ADDRESS"
                  value={settings?.integrations?.smtp?.MAIL_FROM_ADDRESS || ''}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_FROM_ADDRESS:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="MAIL FROM ADDRESS"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="MAIL_FROM_NAME" className="block mb-2 font-medium text-gray-700 text-xs">
                  FROM NAME
                  </label>
                  <input
                  type="text"
                  id="MAIL_FROM_NAME"
                  name="MAIL_FROM_NAME"
                  value={settings?.integrations?.smtp?.MAIL_FROM_NAME || ''}
                  onChange={(e) => setSettings(prev => ({...prev,integrations:{...prev.integrations,smtp:{...prev.integrations.smtp,MAIL_FROM_NAME:e.target.value}}}))}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all"
                  placeholder="FROM NAME"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSMTPSetting(false);
                  }}
                  className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;