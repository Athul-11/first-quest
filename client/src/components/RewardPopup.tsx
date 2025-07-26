import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Star, Trophy, Zap } from 'lucide-react';

interface Reward {
  type: 'xp' | 'coins' | 'achievement' | 'item';
  amount?: number;
  name: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  rewards: Reward[];
  title: string;
  onClaim: () => void;
}

const RewardPopup: React.FC<RewardPopupProps> = ({
  isOpen,
  onClose,
  rewards,
  title,
  onClaim,
}) => {
  const getRewardIcon = (reward: Reward) => {
    if (reward.icon) return reward.icon;
    
    switch (reward.type) {
      case 'xp':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'coins':
        return <Coins className="w-6 h-6 text-yellow-600" />;
      case 'achievement':
        return <Trophy className="w-6 h-6 text-purple-500" />;
      case 'item':
        return <Zap className="w-6 h-6 text-blue-500" />;
      default:
        return <Star className="w-6 h-6 text-yellow-500" />;
    }
  };

  const handleClaim = () => {
    onClaim();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[90vw] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-yellow-600">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-gray-600 mb-6">You've earned amazing rewards!</p>
          </motion.div>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {rewards.map((reward, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getRewardIcon(reward)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {reward.name}
                    </p>
                    {reward.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {reward.description}
                      </p>
                    )}
                  </div>
                </div>
                {reward.amount && (
                  <span className="font-bold text-lg text-yellow-600">
                    +{reward.amount}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="pt-4"
          >
            <Button
              onClick={handleClaim}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Claim Rewards
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardPopup;