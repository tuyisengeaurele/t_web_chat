import { formatTime, formatFileSize } from '../../utils/formatters';

const StatusIcon = ({ status }) => {
  if (status === 'seen') {
    return (
      <span className="text-blue-400">
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 6.5l4.5 4.5L15.5 1.5M5 11L9.5 6.5" strokeWidth="1.5" />
        </svg>
      </span>
    );
  }
  if (status === 'delivered') {
    return <span className="text-gray-400 text-xs">✓✓</span>;
  }
  return <span className="text-gray-400 text-xs">✓</span>;
};

const MessageBubble = ({ message, isMine }) => {
  const isImage = message.type === 'image';
  const isFile = message.type === 'file';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-xs lg:max-w-sm xl:max-w-md rounded-2xl overflow-hidden shadow-sm ${
          isMine
            ? 'bg-emerald-500 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm'
        }`}
      >
        {isImage && message.media?.url && (
          <a href={message.media.url} target="_blank" rel="noopener noreferrer">
            <img
              src={message.media.url}
              alt={message.media.originalName || 'Image'}
              className="max-w-full max-h-64 object-cover"
              loading="lazy"
            />
          </a>
        )}

        {isFile && message.media?.url && (
          <a
            href={message.media.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 hover:opacity-90 transition ${
              isMine ? 'text-white' : 'text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{message.media.originalName}</p>
              <p className="text-xs opacity-70">{formatFileSize(message.media.size)}</p>
            </div>
          </a>
        )}

        {message.content && (
          <p className="px-3 py-2 text-sm leading-relaxed break-words">{message.content}</p>
        )}

        <div className={`flex items-center justify-end gap-1 px-3 pb-1.5 -mt-1 ${isMine ? 'text-emerald-100' : 'text-gray-400'}`}>
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          {isMine && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
