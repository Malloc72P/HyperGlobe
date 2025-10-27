export interface LoadingUIProps {
  loading: boolean;
}

export function LoadingUI({ loading }: LoadingUIProps) {
  if (!loading) return null;

  return (
    <>
      <div
        className="hyperglobe-loading-panel"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          zIndex: 10,
          background: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '24px',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <p>Loading...</p>
      </div>
      <div
        className="hyperglobe-loading-backdrop"
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
          zIndex: 9,
        }}
      ></div>
    </>
  );
}
