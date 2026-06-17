import React from 'react';
import { Users, Settings, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, SectionTitle, Label, InputField, PrimaryBtn } from './Shared';

export default function SettingsTab({
  salon,
  contactForm,
  setContactForm,
  isEditingContact,
  setIsEditingContact,
  saveContactDetails,
  passwordForm,
  setPasswordForm,
  passwordStep,
  setPasswordStep,
  passwordError,
  setPasswordError,
  passwordSuccess,
  setPasswordSuccess,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleVerifyCurrentPassword,
  handleChangePassword,
  passwordFormOpen,
  setPasswordFormOpen,
  deleteConfirmOpen,
  setDeleteConfirmOpen,
  handleDeleteAccount,
  cfg,
  toggleSalonVisibility
}) {
  return (
    <div className="max-w-[600px] flex flex-col gap-6 animate-[fadeUp_0.3s_ease]">
      
      {/* Section 1: Contact details */}
      <Card className="relative">
        <button onClick={() => {
          if (isEditingContact) {
            setIsEditingContact(false);
          } else {
            setIsEditingContact(true);
            setContactForm({
              ownerName: salon?.ownerName || '',
              phone: salon?.phone || '',
              email: salon?.email || ''
            });
          }
        }} className="absolute top-5 right-5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-[11px] font-bold cursor-pointer uppercase tracking-[0.05em] hover:bg-white/[0.08] transition-colors">
          {isEditingContact ? 'Cancel' : 'Edit'}
        </button>

        <SectionTitle icon={Users}>Contact details</SectionTitle>

        {!isEditingContact ? (
          <div className="flex flex-col gap-4 mt-3">
            <div className="grid grid-cols-[120px_1fr] gap-2.5">
              <span className="text-xs text-white/30 font-semibold">Name:</span>
              <span className="text-[13px] text-white font-semibold">{salon?.ownerName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2.5">
              <span className="text-xs text-white/30 font-semibold">Mobile Number:</span>
              <span className="text-[13px] text-white font-semibold font-mono">{salon?.phone || 'Not provided'}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2.5">
              <span className="text-xs text-white/30 font-semibold">Email Address:</span>
              <span className="text-[13px] text-white font-semibold font-mono">{salon?.email}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={saveContactDetails} className="flex flex-col gap-3.5 mt-3">
            <div>
              <Label htmlFor="edit-contact-name">Name</Label>
              <InputField id="edit-contact-name" value={contactForm.ownerName} onChange={e => setContactForm(c => ({ ...c, ownerName: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="edit-contact-phone">Mobile Number</Label>
              <InputField id="edit-contact-phone" value={contactForm.phone} onChange={e => setContactForm(c => ({ ...c, phone: e.target.value.replace(/[^0-9]/g, '') }))} required />
            </div>
            <div>
              <Label htmlFor="edit-contact-email">Email Address</Label>
              <InputField id="edit-contact-email" type="email" value={contactForm.email} onChange={e => setContactForm(c => ({ ...c, email: e.target.value }))} required />
            </div>
            <PrimaryBtn type="submit" className="w-full mt-1.5 !py-[11px]">Save Details</PrimaryBtn>
          </form>
        )}

        <div className="h-[1px] w-full bg-white/[0.06] my-5" />

        {/* Salon Visibility */}
        <div>
          <h3 className="text-[13px] font-bold text-white mb-1">Salon Visibility</h3>
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs text-white/35 m-0 leading-[1.5]">
              Hiding your salon marks it closed and removes it from listing searches. Toggle back to show it again on the TrimSync booking homepage.
            </p>
            <button onClick={toggleSalonVisibility} className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/[0.08] text-xs font-bold cursor-pointer transition-all duration-150 whitespace-nowrap ${cfg.isOffToday ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20' : 'bg-green-500/10 text-green-300 hover:bg-green-500/20'}`}>
              {cfg.isOffToday ? 'Salon Hidden' : 'Salon Visible'}
            </button>
          </div>
        </div>
      </Card>

      {/* Section 2: Login & Security */}
      <Card>
        <SectionTitle icon={Settings}>Login & security</SectionTitle>
        
        {!passwordFormOpen ? (
          <div className="flex items-center justify-between gap-4 mt-3">
            <div>
              <span className="text-[11px] font-bold text-white/25 uppercase tracking-[0.08em]">Password</span>
              <div className="text-[15px] font-semibold text-white/50 mt-1 font-mono">••••••••</div>
            </div>
            <button onClick={() => { setPasswordFormOpen(true); setPasswordStep(1); setPasswordError(''); setPasswordSuccess(''); }} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 text-white text-xs font-semibold cursor-pointer hover:bg-white/[0.08] transition-colors">
              Change password
            </button>
          </div>
        ) : (
          <div className="mt-3">
            {passwordStep === 1 ? (
              <form onSubmit={handleVerifyCurrentPassword} className="flex flex-col gap-3.5">
                <div>
                  <Label htmlFor="current-pwd">Current Password</Label>
                  <div className="relative flex items-center">
                    <InputField
                      id="current-pwd"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 bg-transparent border-none text-white/40 cursor-pointer flex items-center justify-center p-0 hover:text-white/80 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {passwordError && <div className="text-xs text-red-300 font-semibold">{passwordError}</div>}
                <div className="flex gap-2.5 mt-1">
                  <button type="button" onClick={() => {
                    setPasswordFormOpen(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowCurrentPassword(false);
                  }} className="flex-1 p-[11px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white text-[13px] font-semibold cursor-pointer hover:bg-white/[0.08] transition-colors">
                    Cancel
                  </button>
                  <PrimaryBtn type="submit" className="flex-1 !py-[11px]">Next</PrimaryBtn>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3.5">
                <div>
                  <Label htmlFor="new-pwd">New Password</Label>
                  <div className="relative flex items-center">
                    <InputField
                      id="new-pwd"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={passwordForm.newPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 bg-transparent border-none text-white/40 cursor-pointer flex items-center justify-center p-0 hover:text-white/80 transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-pwd">Confirm New Password</Label>
                  <div className="relative flex items-center">
                    <InputField
                      id="confirm-pwd"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 bg-transparent border-none text-white/40 cursor-pointer flex items-center justify-center p-0 hover:text-white/80 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {passwordError && <div className="text-xs text-red-300 font-semibold">{passwordError}</div>}
                {passwordSuccess && <div className="text-xs text-green-300 font-semibold">{passwordSuccess}</div>}
                <div className="flex gap-2.5 mt-1">
                  <button type="button" onClick={() => {
                    setPasswordFormOpen(false);
                    setPasswordStep(1);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }} className="flex-1 p-[11px] bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white text-[13px] font-semibold cursor-pointer hover:bg-white/[0.08] transition-colors">
                    Cancel
                  </button>
                  <PrimaryBtn type="submit" className="flex-1 !py-[11px]">Save Password</PrimaryBtn>
                </div>
              </form>
            )}
          </div>
        )}
      </Card>

      {/* Section 3: Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/[0.02]">
        <div className="flex items-center gap-2.5 mb-3">
          <Trash2 size={18} className="text-red-300" />
          <h2 className="text-[15px] font-bold text-red-300 m-0">Delete account</h2>
        </div>
        
        <p className="text-xs text-red-300/50 leading-[1.6] m-0 mb-4">
          You will delete all your personal info and won't be able to retrieve it. Are you sure you want to delete your account?
        </p>

        {!deleteConfirmOpen ? (
          <button onClick={() => setDeleteConfirmOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-300 border border-red-500/25 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:bg-red-500/20">
            Delete Account
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-[14px_16px] bg-red-500/5 rounded-[10px] border border-red-500/15">
            <div className="text-xs font-bold text-red-300">Are you absolutely sure? This cannot be undone.</div>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirmOpen(false)} className="flex-1 py-2 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-xs font-semibold cursor-pointer hover:bg-white/[0.08] transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2 px-3 bg-red-500 border-none rounded-lg text-white text-xs font-semibold cursor-pointer hover:bg-red-600 transition-colors">
                Yes, Delete My Account
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
