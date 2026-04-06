import Avatar from '../common/Avatar';
import { formatLastSeen } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';

const ChatHeader = ({ conversation }) => {
  const { user: currentUser } = useAuthStore();

  const other = conversation?.participants?.find(
    (p) => p._id !== currentUser?._id
  );

  if (!other) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
      <Avatar user={other} size="md" showOnline />
      <div>
        <p className="font-semibold text-sm text-gray-900">{other.username}</p>
        <p className="text-xs text-gray-500">
          {other.isOnline ? (
            <span className="text-emerald-600 font-medium">Online</span>
          ) : (
            `Last seen ${formatLastSeen(other.lastSeen)}`
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
