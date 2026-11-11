/**
 * Pampa ao entardecer, em SVG puro (sem imagens externas): céu em degradê,
 * sol se pondo, araucárias na serra ao fundo, figueira, galpão com fumaça
 * saindo da chaminé, cerca com a porteira aberta e capim na frente.
 * Decorativa (aria-hidden): o texto da página já diz o que importa.
 */
export default function PampaIlustracao() {
  return (
    <svg
      className="lp-pampa"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lp-ceu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081631" />
          <stop offset="0.32" stopColor="#1d3566" />
          <stop offset="0.55" stopColor="#5b4479" />
          <stop offset="0.72" stopColor="#c8685a" />
          <stop offset="0.86" stopColor="#f0a24f" />
          <stop offset="1" stopColor="#f9d27a" />
        </linearGradient>
        <radialGradient id="lp-brilho" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffc46b" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff9a4d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lp-serra" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5f8f" />
          <stop offset="1" stopColor="#3e4a73" />
        </linearGradient>
        <linearGradient id="lp-coxilha" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f7556" />
          <stop offset="1" stopColor="#1f4434" />
        </linearGradient>
        <linearGradient id="lp-frente" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c3a28" />
          <stop offset="1" stopColor="#0c1d14" />
        </linearGradient>
        <symbol id="lp-araucaria" viewBox="0 0 60 100">
          <rect x="28.5" y="22" width="3" height="78" />
          <path d="M2 30 Q16 38 30 31 Q44 38 58 30 Q44 25 30 27 Q16 25 2 30Z" />
          <path d="M8 18 Q19 25 30 19 Q41 25 52 18 Q41 13 30 15 Q19 13 8 18Z" />
          <path d="M16 8 Q23 13 30 9 Q37 13 44 8 Q37 4 30 5 Q23 4 16 8Z" />
          <path d="M20 31 L30 40 L40 31" fill="none" stroke="currentColor" strokeWidth="2" />
        </symbol>
      </defs>

      <rect width="1600" height="900" fill="url(#lp-ceu)" />

      {/* estrelas */}
      <g fill="#fff6dc">
        {[[90,60,1.6],[230,140,1.1],[400,40,1.9],[560,110,1.2],[700,30,1.5],[850,90,1.1],[990,50,1.8],
          [1130,120,1.2],[1270,40,1.6],[1400,100,1.3],[1530,55,1.8],[300,230,1],[1480,220,1],[640,200,0.9]]
          .map(([x,y,r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} opacity={0.5 + r / 4} />)}
      </g>

      {/* sol */}
      <g className="lp-sol">
        <circle cx="1120" cy="640" r="380" fill="url(#lp-brilho)" />
        <circle cx="1120" cy="640" r="110" fill="#fbe08e" />
        <circle cx="1120" cy="640" r="110" fill="none" stroke="#fff3c4" strokeWidth="3" opacity=".6" />
      </g>

      {/* quero-queros */}
      <g fill="none" stroke="#1a2440" strokeWidth="3.2" strokeLinecap="round" opacity=".8">
        <path d="M760 330 q15 -13 28 0 q13 -13 28 0" />
        <path d="M835 292 q11 -10 21 0 q10 -10 21 0" />
        <path d="M892 340 q8 -7 16 0 q8 -7 16 0" />
        <path d="M700 300 q7 -6 13 0 q6 -6 13 0" />
      </g>

      {/* serra ao fundo com araucárias */}
      <path d="M0 640 C140 590 260 600 380 620 C520 642 640 580 800 585 C960 590 1060 640 1240 630 C1380 622 1500 595 1600 588 L1600 900 L0 900 Z"
        fill="url(#lp-serra)" opacity=".9" />
      <g fill="#33406a" color="#33406a">
        <use href="#lp-araucaria" x="130" y="548" width="52" height="86" />
        <use href="#lp-araucaria" x="178" y="566" width="40" height="66" />
        <use href="#lp-araucaria" x="610" y="520" width="58" height="96" />
        <use href="#lp-araucaria" x="660" y="545" width="42" height="70" />
        <use href="#lp-araucaria" x="1440" y="520" width="56" height="92" />
        <use href="#lp-araucaria" x="1490" y="540" width="44" height="72" />
      </g>

      {/* coxilha do meio */}
      <path d="M0 700 C170 660 320 668 480 685 C660 704 790 652 960 656 C1130 660 1260 705 1420 696 C1500 692 1560 682 1600 676 L1600 900 L0 900 Z"
        fill="url(#lp-coxilha)" />

      {/* galpão com fumaça */}
      <g transform="translate(1260 628)">
        <path className="lp-fumaca" d="M74 -16 C64 -36 86 -50 74 -70 C64 -88 84 -100 76 -122"
          fill="none" stroke="#e9e1d4" strokeWidth="6" strokeLinecap="round" opacity=".35" />
        <rect x="68" y="-16" width="12" height="22" fill="#14301f" />
        <path d="M0 58 L0 20 L52 -6 L104 20 L104 58 Z" fill="#183b2b" />
        <path d="M-10 22 L52 -12 L114 22" fill="none" stroke="#10291d" strokeWidth="7" strokeLinejoin="round" />
        <rect className="lp-janela" x="16" y="26" width="18" height="15" fill="#ffd25a" />
        <rect className="lp-janela" x="70" y="26" width="18" height="15" fill="#ffd25a" />
        <rect x="44" y="30" width="16" height="28" fill="#0d2318" />
      </g>

      {/* figueira */}
      <g fill="#12301f">
        <path d="M318 705 C322 668 315 640 298 618 L311 613 C326 630 334 648 337 670 C343 645 358 626 381 613 L388 624 C365 640 352 663 348 707 Z" />
        <ellipse cx="290" cy="590" rx="84" ry="46" />
        <ellipse cx="372" cy="574" rx="92" ry="54" />
        <ellipse cx="330" cy="544" rx="74" ry="42" />
        <ellipse cx="428" cy="600" rx="58" ry="32" />
        <ellipse cx="236" cy="610" rx="46" ry="25" />
      </g>

      {/* campo da frente */}
      <path d="M0 770 C220 742 430 750 650 764 C870 778 1070 748 1270 752 C1430 756 1540 768 1600 772 L1600 900 L0 900 Z"
        fill="url(#lp-frente)" />

      {/* cerca e porteira aberta */}
      <g stroke="#08150e" strokeLinecap="round">
        <g strokeWidth="10">
          {[70, 200, 330, 460, 760, 890, 1020].map(x => (
            <line key={x} x1={x} y1="808" x2={x} y2="718" />
          ))}
        </g>
        <g strokeWidth="2.4" fill="none" opacity=".9">
          <path d="M70 736 Q135 744 200 739 Q265 746 330 741 Q395 745 460 735" />
          <path d="M70 764 Q135 772 200 767 Q265 774 330 769 Q395 773 460 763" />
          <path d="M760 734 Q825 743 890 740 Q955 745 1020 742" />
          <path d="M760 762 Q825 771 890 768 Q955 773 1020 770" />
        </g>
        <g strokeWidth="8">
          <line x1="460" y1="726" x2="602" y2="768" />
          <line x1="460" y1="792" x2="602" y2="812" />
          <line x1="602" y1="764" x2="602" y2="816" />
          <line x1="460" y1="792" x2="602" y2="768" />
          <line x1="460" y1="759" x2="602" y2="790" strokeWidth="5" />
        </g>
      </g>

      {/* capim */}
      <g stroke="#0a1a11" strokeWidth="3" strokeLinecap="round" fill="none">
        {[30, 140, 270, 400, 540, 680, 820, 960, 1100, 1180, 1330, 1460, 1570].map(x => (
          <path key={x} d={`M${x} 900 q-6 -40 -18 -62 M${x} 900 q2 -46 8 -70 M${x} 900 q10 -36 26 -54`} />
        ))}
      </g>
    </svg>
  )
}
