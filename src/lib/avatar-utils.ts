export const AVATAR_GRADIENTS = [
  "from-emerald-400 to-teal-400",
  "from-blue-400 to-indigo-400",
  "from-purple-400 to-pink-400",
  "from-pink-400 to-rose-400",
  "from-orange-400 to-amber-400",
  "from-green-400 to-lime-400",
  "from-cyan-400 to-blue-400",
  "from-violet-400 to-fuchsia-400",
];

export const getAvatarGradient = (userId: string) => {
  if (!userId) return AVATAR_GRADIENTS[0];
  const charSum = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[charSum % AVATAR_GRADIENTS.length];
};