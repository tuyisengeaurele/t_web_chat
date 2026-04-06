const TypingIndicator = ({ users }) => {
  if (!users.length) return null;

  const label =
    users.length === 1
      ? `${users[0].username} is typing`
      : `${users.map((u) => u.username).join(', ')} are typing`;

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex items-center gap-1 bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
};

export default TypingIndicator;
