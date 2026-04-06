import Avatar from '../common/Avatar';
import { formatTime, formatDate } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user: currentUser } = useAuthStore();

  const otherParticipant = conversation.participants?.find(
    (p) => p._id !== currentUser?._id
  );

  const lastMsg = conversation.lastMessage;
  const isLastMsgMine = lastMsg?.sender?._id === currentUser?._id || lastMsg?.sender === currentUser?._id;

  const lastMsgText = () => {
    if (!lastMsg) return 'Start a conversation';
    if (lastMsg.type === 'image') return isLastMsgMine ? 'You sent an image' : 'Sent an image';
    if (lastMsg.type === 'file') return isLastMsgMine ? 'You sent a file' : 'Sent a file';
    return isLastMsgMine ? `You: ${lastMsg.content}` : lastMsg.content;
  };

  const timestamp = lastMsg?.createdAt || conversation.createdAt;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${
        isActive ? 'bg-emerald-50 border-r-2 border-emerald-500' : ''
      }`}
    >
      <Avatar user={otherParticipant} size="md" showOnline />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-gray-900 truncate">
            {otherParticipant?.username || 'Unknown'}
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">
            {formatDate(timestamp) === 'Today' ? formatTime(timestamp) : formatDate(timestamp)}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">{lastMsgText()}</p>
      </div>
    </button>
  );
};

export default ConversationItem;
