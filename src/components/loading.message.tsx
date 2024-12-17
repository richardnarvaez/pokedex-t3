interface LoadingMessageProps {
  message?: string;
  className?: string;
}

export const LoadingMessage = ({ 
  message = "Cargando más Pokémon...",
  className = "mt-8 text-center text-sm text-gray-500"
}: LoadingMessageProps) => {
  return (
    <div className={className}>
      {message}
    </div>
  );
}; 