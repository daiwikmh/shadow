'use client';

interface AttestationBarProps {
  online: boolean;
}

export default function AttestationBar({ online }: AttestationBarProps) {
  const monoFont = { fontFamily: 'var(--font-geist-mono)' };

  return (
    <div
      className="flex items-center gap-6 px-5 flex-shrink-0"
      style={{
        height: '36px',
        background: '#0D0D0D',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Health indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${online ? 'animate-pulse' : ''}`}
          style={{ background: online ? '#00D897' : '#FF3B5C' }}
        />
        <span className="text-[10px] text-[#4A4A4A]" style={monoFont}>
          {online ? 'Backend Online' : 'Backend Offline'}
        </span>
      </div>

      {/* TEE Attestation */}
      <a
        href="https://verify.eigencloud.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-[#7C5CFC] text-xs">◈</span>
        <span className="text-[10px] text-[#4A4A4A] hover:text-[#7C5CFC] transition-colors" style={monoFont}>
          TEE Attested
        </span>
      </a>

      {/* Flashbots */}
      <a
        href="https://relay-sepolia.flashbots.net"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-[10px] text-[#4A4A4A] hover:text-[#F0F0F0] transition-colors" style={monoFont}>
          Flashbots Protected
        </span>
      </a>

      {/* Network */}
      <div className="ml-auto flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#7C5CFC' }} />
        <span className="text-[10px] text-[#4A4A4A]" style={monoFont}>
          Sepolia Testnet
        </span>
      </div>
    </div>
  );
}
