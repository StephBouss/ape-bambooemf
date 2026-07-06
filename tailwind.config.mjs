/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        'vert-marque': '#499E35',
        'vert-vif': '#43B14A',
        'vert-foret': '#1E7A2F',
        'charbon': '#3C3C3C',
        'bleu-roi': '#3E6CB2',
        'navy': '#274979',
        'jaune-taux': '#F6C41F',
        'menthe-fond': '#F1F7F4',
        'encre': '#263029',
        'muted': '#5B6B61',
        'filet': '#DDE8E1',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(30,50,30,.05), 0 8px 24px -12px rgba(30,50,30,.18)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(160deg, #E9F6EF 0%, #D3F0E8 55%, #D3F0E8 100%)',
        'hero-halo': 'radial-gradient(900px 420px at 88% -8%, #FBF3D6 0%, transparent 60%)',
        'pastille-gradient': 'linear-gradient(135deg, #274979 0%, #499E35 100%)',
        'wordmark-gradient': 'linear-gradient(180deg, #6E6E6E 0%, #2E2E2E 100%)',
      },
    },
  },
  plugins: [],
};
