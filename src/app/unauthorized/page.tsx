/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
export default function UnauthorizedPage() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1E1E1E',
      color: '#FFF8F0',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <img src="/logo.png" alt="logo" />
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', marginTop: '2rem' }}>Acesso Negado!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Você não tem permissão para acessar esta página.
      </p>
      <a
        href="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#B0E298',
          color: '#000',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Voltar para a página inicial
      </a>
    </div>
  );
}
