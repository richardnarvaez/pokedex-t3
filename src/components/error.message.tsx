interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="p-8 text-center text-2xl text-gray-900">
      Error al cargar los Pokémon: {message}
    </div>
  );
}; 