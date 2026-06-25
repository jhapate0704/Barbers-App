import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

export default function ProfileTab({ customerId, activeProfileSection }) {
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', country: 'India', hairType: '', beardStyle: '',
    notifications: { email: true, sms: true }, avatar: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
  const [supportSuccess, setSupportSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/${customerId}`);
        if (res.data) {
          setProfileData({
            name: res.data.name || '', email: res.data.email || '', phone: res.data.phone || '',
            country: res.data.country || 'India', hairType: res.data.hairType || '', beardStyle: res.data.beardStyle || '',
            notifications: res.data.notifications || { email: true, sms: true }, avatar: res.data.avatar || ''
          });
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    if (customerId) fetchUserProfile();
  }, [customerId]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      const payload = {
        userId: customerId,
        name: profileData.name, email: profileData.email, phone: profileData.phone,
        country: profileData.country, hairType: profileData.hairType, beardStyle: profileData.beardStyle,
        notifications: profileData.notifications, avatar: profileData.avatar
      };

      if (passwordForm.newPassword) {
        if (passwordForm.newPassword.length < 6) {
          setProfileError('New password must be at least 6 characters.');
          setSavingProfile(false);
          return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setProfileError('Passwords do not match.');
          setSavingProfile(false);
          return;
        }
        payload.currentPassword = passwordForm.currentPassword;
        payload.newPassword = passwordForm.newPassword;
      }

      const token = localStorage.getItem('customerToken');
      const res = await axios.put(`${API_BASE}/users/profile/update`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSuccess('Profile updated successfully!');
      
      localStorage.setItem('customerName', res.data.user.name);
      localStorage.setItem('customerAvatar', res.data.user.avatar || '');
      
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
      
      setProfileData({
        name: res.data.user.name || '', email: res.data.user.email || '', phone: res.data.user.phone || '',
        country: res.data.user.country || 'India', hairType: res.data.user.hairType || '', beardStyle: res.data.user.beardStyle || '',
        notifications: res.data.user.notifications || { email: true, sms: true }, avatar: res.data.user.avatar || ''
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    if (!supportForm.subject || !supportForm.message) return;
    setSupportSuccess(true);
    setSupportForm({ subject: '', message: '' });
    setTimeout(() => {
      setSupportSuccess(false);
    }, 4000);
  };

  return (
    <div className="bg-white border border-indigo-100/60 shadow-sm rounded-3xl p-6 md:p-8 relative animate-[fadeIn_0.3s_ease]">
      {profileError && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-600 p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" /> {profileError}
        </div>
      )}
      {profileSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 p-3.5 rounded-xl mb-6 text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} className="shrink-0" /> {profileSuccess}
        </div>
      )}

      {activeProfileSection === 'my-profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">My Profile</h2>
            <p className="text-xs text-slate-500">Manage your avatar details and grooming style preferences.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white border border-indigo-100/60 rounded-2xl">
            <div className="relative group shrink-0">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/40" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-2 ring-violet-500/20">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-[10px] font-bold text-white cursor-pointer transition-opacity">
                CHANGE
                <input type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left space-y-2">
              <label htmlFor="avatar-file-upload" className="text-xs font-bold text-violet-500 hover:text-violet-600 cursor-pointer underline">
                Upload new profile picture
                <input id="avatar-file-upload" type="file" accept="image/*" onChange={handleAvatarFileChange} className="hidden" />
              </label>
              <p className="text-[10px] text-slate-500">Supports PNG, JPG, or GIF up to 2MB. Preset avatar initializes automatically from name.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-fullname" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</label>
            <input
              id="profile-fullname" type="text" value={profileData.name} onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold" required
            />
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Style Preferences</h3>
              <p className="text-[11px] text-slate-500">Select your hair texture and beard choice to help barbers prepare styles custom-tailored to you.</p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Hair Texture</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Straight', 'Wavy', 'Curly', 'Coily'].map(style => (
                  <button
                    key={style} type="button" onClick={() => setProfileData(prev => ({ ...prev, hairType: style }))}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      profileData.hairType === style ? 'bg-violet-600/15 border-violet-500 text-violet-600 shadow-md shadow-violet-500/5' : 'bg-white border-indigo-100/60 text-slate-500 hover:text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Beard Preference</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Clean Shaven', 'Stubble', 'Full Beard', 'Goatee'].map(style => (
                  <button
                    key={style} type="button" onClick={() => setProfileData(prev => ({ ...prev, beardStyle: style }))}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      profileData.beardStyle === style ? 'bg-violet-600/15 border-violet-500 text-violet-600 shadow-md shadow-violet-500/5' : 'bg-white border-indigo-100/60 text-slate-500 hover:text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="bg-[linear-gradient(135deg,#8b5cf6_0%,#d946ef_100%)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-250 hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-10px_rgba(139,92,246,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto border-none">
            {savingProfile ? 'Saving Details...' : 'Save Details'}
          </button>
        </form>
      )}

      {activeProfileSection === 'personal-settings' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Personal Settings</h2>
            <p className="text-xs text-slate-500">Edit contact details, configure notification options, or update your account password.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <input
              id="settings-email" type="email" value={profileData.email} onChange={e => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold" required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-phone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number</label>
            <input
              id="settings-phone" type="tel" value={profileData.phone} onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '') }))}
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold" required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-country" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Country</label>
            <select
              id="settings-country" value={profileData.country} onChange={e => setProfileData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold bg-white"
            >
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Communication Preferences</span>
            <div className="space-y-2.5">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox" checked={profileData.notifications.email} onChange={e => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, email: e.target.checked } }))}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold">Receive booking summaries and reminders via Email</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox" checked={profileData.notifications.sms} onChange={e => setProfileData(prev => ({ ...prev, notifications: { ...prev.notifications, sms: e.target.checked } }))}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
                <span className="text-xs text-slate-700 font-semibold">Receive live queue alerts and SMS updates</span>
              </label>
            </div>
          </div>

          <div className="border-t border-indigo-100/60 pt-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Change Password</h3>
              <p className="text-[11px] text-slate-500">Leave these fields blank if you do not wish to update your password.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="settings-curr-pwd" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Password</label>
              <div className="relative">
                <input
                  id="settings-curr-pwd" type={showCurrentPassword ? "text" : "password"} placeholder="Enter current password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center p-1">
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="settings-new-pwd" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <input
                    id="settings-new-pwd" type={showNewPassword ? "text" : "password"} placeholder="Min. 6 characters" value={passwordForm.newPassword} onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center p-1">
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="settings-confirm-pwd" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <input
                    id="settings-confirm-pwd" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm new password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 pr-11 text-sm text-slate-800 outline-none focus:border-violet-500/50 transition-colors font-semibold"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center justify-center p-1">
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="bg-[linear-gradient(135deg,#8b5cf6_0%,#d946ef_100%)] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] transition-all duration-250 hover:-translate-y-[1px] hover:shadow-[0_14px_36px_-10px_rgba(139,92,246,0.75),inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-0 active:scale-95 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto border-none">
            {savingProfile ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </form>
      )}

      {activeProfileSection === 'help-support' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Help & Support</h2>
            <p className="text-xs text-slate-500">Read cancellation details or send a query directly to the TrimSync administration team.</p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Frequently Asked Questions</span>
            <div className="space-y-2.5">
              {[
                { q: 'How do I check my position in the queue?', a: 'Go to your "Upcoming Bookings" tab. On the day of your appointment, a live queue tracker shows your real-time position (e.g. #3) and the number of people ahead of you.' },
                { q: 'What is the booking cancellation policy?', a: 'You can cancel any booking free of charge up to 2 hours prior to the scheduled slot. The cancellation option is available in the booking details card.' },
                { q: 'Can I request an earlier time slot?', a: 'Yes! If a barber finishes early, TrimSync will auto-generate an early shift invitation. You will see a notification bar at the top of your dashboard to accept or decline the change.' }
              ].map((faq, idx) => (
                <details key={idx} className="group bg-white border border-indigo-100/60 rounded-2xl p-4 cursor-pointer [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex justify-between items-center text-xs font-bold text-slate-800 outline-none select-none">
                    <span>{faq.q}</span>
                    <span className="text-violet-400 transition-transform duration-200 group-open:rotate-180">▼</span>
                  </summary>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2.5 pt-2.5 border-t border-indigo-100/60">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>

          <form onSubmit={handleSupportSubmit} className="space-y-4 border-t border-indigo-100/60 pt-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Submit Support Ticket</h3>
              <p className="text-[11px] text-slate-500">Have feedback or encountered issues? Submit details below and we will investigate.</p>
            </div>

            {supportSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0" /> Support ticket submitted successfully! We will get back to you shortly.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="support-subject" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Subject / Issue Title</label>
              <input
                id="support-subject" type="text" value={supportForm.subject} onChange={e => setSupportForm(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g. Queue tracker delay or payment enquiry"
                className="w-full bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none focus:border-violet-500/50 transition-colors" required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="support-message" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Message Details</label>
              <textarea
                id="support-message" value={supportForm.message} onChange={e => setSupportForm(prev => ({ ...prev, message: e.target.value }))} placeholder="Please describe your problem or suggestions here..."
                className="w-full h-28 bg-white border border-indigo-100/60 rounded-xl px-4 py-3 text-xs text-slate-800 outline-none focus:border-violet-500/50 transition-colors resize-none bg-transparent" required
              />
            </div>

            <button type="submit" className="bg-white/90 backdrop-blur-xl border border-violet-500/25 text-violet-600 hover:text-slate-900 hover:bg-violet-600/10 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer w-full sm:w-auto">
              Submit Ticket
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
