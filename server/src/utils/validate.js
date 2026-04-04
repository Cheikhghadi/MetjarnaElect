const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const THREAD_ID_RE = /^[a-fA-F0-9]{24}_[a-fA-F0-9]{24}$/;

const isValidObjectId = (id) => typeof id === 'string' && OBJECT_ID_RE.test(id);

const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  const e = email.trim().toLowerCase();
  if (e.length < 5 || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
};

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const isValidThreadId = (threadId) => typeof threadId === 'string' && THREAD_ID_RE.test(threadId);

module.exports = {
  isValidObjectId,
  isValidEmail,
  normalizeEmail,
  isValidThreadId,
};
