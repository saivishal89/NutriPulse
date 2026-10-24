import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Sparkles,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'ios'>('instant');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ais-pre-cygjsg4fsluumrwojphwqi-693077039992.asia-southeast1.run.app';

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        onClose();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-[#0f131c] border border-white/10 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#161a24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff5708] to-[#ff8c42] flex items-center justify-center shadow-[0_0_16px_rgba(255,87,8,0.4)]">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-lg text-white">
                  Download Phone App
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff5708]/20 text-[#ffdbcf] border border-[#ff5708]/30">
                  Android & APK
                </span>
              </div>
              <p className="text-xs text-[#e5beb2]/70 font-sans">
                Install NutriPulse directly on your mobile device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 p-2 bg-[#090d16] border-b border-white/5 gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('instant')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'instant'
                ? 'bg-[#1c212d] text-[#ffdbcf] border border-[#ff5708]/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#ff5708]" />
            <span>1-Tap Install</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'apk'
                ? 'bg-[#1c212d] text-[#ffdbcf] border border-[#ff5708]/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Raw .APK File</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'ios'
                ? 'bg-[#1c212d] text-[#ffdbcf] border border-[#ff5708]/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {/* TAB 1: 1-Tap Phone Install (Android WebAPK) */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#ff5708]/10 via-[#1c212d] to-[#121620] border border-[#ff5708]/30">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#ff5708]/20 text-[#ff5708] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      Official Android WebAPK Minting
                    </h4>
                    <p className="text-xs text-[#e5beb2]/80 mt-1 leading-relaxed">
                      Android automatically packages this app as a native APK in the background. It installs directly into your phone’s app launcher with full-screen experience, zero browser borders, and camera access!
                    </p>
                  </div>
                </div>

                {isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    disabled={isInstalling}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff5708] to-[#ff8c42] text-white font-bold text-sm shadow-[0_0_20px_rgba(255,87,8,0.4)] hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'Installing to Device...' : 'Install App to Phone Now'}</span>
                  </button>
                ) : isInstalled ? (
                  <div className="mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>NutriPulse is already installed on this device!</span>
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-[#ffb59c] bg-[#ff5708]/10 p-3 rounded-lg border border-[#ff5708]/20">
                    💡 <strong>To install on your phone right now:</strong>
                  </div>
                )}
              </div>

              {/* Step by step for phone */}
              <div className="space-y-3">
                <h5 className="text-xs uppercase tracking-wider font-mono text-slate-400 font-bold">
                  How to open & install on your phone:
                </h5>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium">Open NutriPulse URL on your phone's Chrome</p>
                    <div className="mt-1 flex items-center gap-2">
                      <input 
                        readOnly 
                        value={currentUrl} 
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] font-mono text-slate-300 flex-1 truncate select-all"
                      />
                      <button
                        onClick={copyUrlToClipboard}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedLink ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    2
                  </div>
                  <p className="text-xs text-slate-300">
                    Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    3
                  </div>
                  <p className="text-xs text-slate-300">
                    Tap <strong className="text-[#ff5708]">"Install app"</strong> or <strong className="text-[#ff5708]">"Add to Home screen"</strong>. Android will download the WebAPK and create the icon in your phone's app list!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Standalone .APK File Generation */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#161a24] border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      Need a raw standalone <code className="text-blue-300">.apk</code> file?
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Google's official <strong>Bubblewrap CLI</strong> turns this PWA manifest into a release-ready Android APK in one terminal command:
                    </p>
                  </div>
                </div>

                {/* Terminal Snippet 1 */}
                <div className="mt-4 bg-black/60 rounded-xl p-3 border border-white/10 font-mono text-xs text-emerald-400 space-y-1">
                  <div className="text-slate-500"># 1. Initialize Android package from PWA manifest</div>
                  <div className="text-white">
                    npx @bubblewrap/cli init --manifest={currentUrl}/manifest.webmanifest
                  </div>
                  <div className="text-slate-500 mt-2"># 2. Build signed nutripulse.apk</div>
                  <div className="text-white">
                    npx @bubblewrap/cli build
                  </div>
                </div>
              </div>

              {/* Capacitor Alternative */}
              <div className="p-4 rounded-xl bg-[#161a24] border border-white/5 space-y-2">
                <h5 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Alternative: Capacitor Android Studio project
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If you prefer compiling directly through Android Studio:
                </p>
                <div className="bg-black/60 rounded-xl p-3 border border-white/10 font-mono text-xs text-slate-200">
                  <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                  <div>npx cap init NutriPulse com.nutripulse.app</div>
                  <div>npm run build && npx cap add android</div>
                  <div>npx cap open android</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: iOS / iPhone */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <h4 className="font-semibold text-white text-sm">
                  Apple iPhone & iPad Installation
                </h4>
                <p className="text-xs text-purple-200/80 mt-1">
                  Safari on iOS supports full standalone PWA installation via the Share sheet:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    1
                  </div>
                  <p className="text-xs text-slate-300">
                    Open this URL in <strong>Safari</strong> on your iPhone.
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    2
                  </div>
                  <p className="text-xs text-slate-300">
                    Tap the <strong>Share button</strong> (the square with an arrow pointing up at the bottom toolbar).
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#161a24] border border-white/5">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                    3
                  </div>
                  <p className="text-xs text-slate-300">
                    Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>. Tap <strong>Add</strong> in the top right.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#121620] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PWA & WebAPK ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
