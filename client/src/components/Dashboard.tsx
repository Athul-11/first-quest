@@ .. @@
 import React, { useState } from 'react';
 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
-import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
-import { Button } from '@/components/ui/button';
-import { Progress } from '@/components/ui/progress';
-import { Badge } from '@/components/ui/badge';
-import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
-import { Input } from '@/components/ui/input';
-import { Label } from '@/components/ui/label';
-import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
+import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
+import { Button } from '@/components/ui/button';
+import { Progress } from '@/components/ui/progress';
+import { Badge } from '@/components/ui/badge';
+import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
+import { Input } from '@/components/ui/input';
+import { Label } from '@/components/ui/label';
+import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
+import RewardPopup from '@/components/RewardPopup';
 import { 
   User, 
   Dumbbell, 
@@ -18,6 +19,7 @@
   Trophy,
   Target,
   ShoppingCart,
+  Gift,
   TrendingUp,
   Calendar,
   Clock,
@@ -25,6 +27,7 @@
   Zap,
   Heart,
   Shield,
+  CheckCircle,
   Coins as CoinsIcon
 } from 'lucide-react';
 
@@ -32,6 +35,8 @@
   const [isWorkoutDialogOpen, setIsWorkoutDialogOpen] = useState(false);
   const [isQuestDialogOpen, setIsQuestDialogOpen] = useState(false);
   const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
+  const [isRewardPopupOpen, setIsRewardPopupOpen] = useState(false);
+  const [pendingRewards, setPendingRewards] = useState<any[]>([]);
   const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
   const [workoutData, setWorkoutData] = useState({
     calories: '',
@@ -39,6 +44,7 @@
     exerciseMinutes: '',
     activityType: 'cardio'
   });
+  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
 
   const queryClient = useQueryClient();
 
@@ -108,6 +114,32 @@
     }
   });
 
+  const claimDailyReward = useMutation({
+    mutationFn: async () => {
+      const response = await fetch('/api/rewards/daily', {
+        method: 'POST',
+        credentials: 'include',
+      });
+      if (!response.ok) throw new Error('Failed to claim daily reward');
+      return response.json();
+    },
+    onSuccess: (data) => {
+      setPendingRewards([
+        { type: 'xp', amount: data.xpReward, name: 'Daily Login XP' },
+        { type: 'coins', amount: data.coinReward, name: 'Daily Login Bonus' }
+      ]);
+      setIsRewardPopupOpen(true);
+      setDailyRewardClaimed(true);
+      queryClient.invalidateQueries({ queryKey: ['user'] });
+    }
+  });
+
+  const handleClaimRewards = () => {
+    // Rewards are already processed on the backend
+    setPendingRewards([]);
+    setIsRewardPopupOpen(false);
+  };
+
   const upgradeCharacter = useMutation({
     mutationFn: async (upgrades: any) => {
       const response = await fetch('/api/character/upgrade', {
@@ -139,7 +171,7 @@
   if (isLoading) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
-        <div className="text-white text-xl">Loading your adventure...</div>
+        <div className="text-white text-xl px-4 text-center">Loading your adventure...</div>
       </div>
     );
   }
@@ -147,7 +179,7 @@
   if (error) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
-        <div className="text-red-400 text-xl">Error loading dashboard</div>
+        <div className="text-red-400 text-xl px-4 text-center">Error loading dashboard</div>
       </div>
     );
   }
@@ -158,10 +190,10 @@
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
-      <div className="container mx-auto px-4 py-8">
+      <div className="container mx-auto px-4 py-4 sm:py-8">
         {/* Header */}
-        <div className="flex justify-between items-center mb-8">
-          <div className="flex items-center space-x-4">
+        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
+          <div className="flex items-center space-x-3 sm:space-x-4">
             <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
               <User className="w-6 h-6 text-white" />
             </div>
@@ -171,7 +203,7 @@
               <p className="text-purple-200">Level {character.level} Hero</p>
             </div>
           </div>
-          <div className="flex items-center space-x-4">
+          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
             <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
               <CoinsIcon className="w-4 h-4 mr-1" />
               {character.coins}
@@ -180,13 +212,26 @@
               <Zap className="w-4 h-4 mr-1" />
               {character.xp} XP
             </Badge>
+            {!dailyRewardClaimed && (
+              <Button
+                onClick={() => claimDailyReward.mutate()}
+                disabled={claimDailyReward.isPending}
+                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
+              >
+                <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
+                Daily Reward
+              </Button>
+            )}
           </div>
         </div>
 
         {/* Character Stats */}
-        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
+        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
-            <CardContent className="p-6">
+            <CardContent className="p-3 sm:p-6">
+              <div className="flex items-center justify-between mb-2">
+                <Sword className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
+              </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-white/80 text-sm">Strength</span>
                 <Sword className="w-5 h-5 text-red-400" />
@@ -196,7 +241,10 @@
             </CardContent>
           </Card>
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
-            <CardContent className="p-6">
+            <CardContent className="p-3 sm:p-6">
+              <div className="flex items-center justify-between mb-2">
+                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
+              </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-white/80 text-sm">Endurance</span>
                 <Heart className="w-5 h-5 text-green-400" />
@@ -206,7 +254,10 @@
             </CardContent>
           </Card>
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
-            <CardContent className="p-6">
+            <CardContent className="p-3 sm:p-6">
+              <div className="flex items-center justify-between mb-2">
+                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
+              </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-white/80 text-sm">Agility</span>
                 <Zap className="w-5 h-5 text-blue-400" />
@@ -216,7 +267,10 @@
             </CardContent>
           </Card>
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
-            <CardContent className="p-6">
+            <CardContent className="p-3 sm:p-6">
+              <div className="flex items-center justify-between mb-2">
+                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
+              </div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-white/80 text-sm">Health</span>
                 <Shield className="w-5 h-5 text-purple-400" />
@@ -230,8 +284,8 @@
         </div>
 
         {/* Action Bar */}
-        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
-          <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
+        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
+          <Dialog open={isWorkoutDialogOpen} onOpenChange={setIsWorkoutDialogOpen}>
             <DialogTrigger asChild>
               <Button className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex flex-col items-center justify-center space-y-2">
                 <Dumbbell className="w-6 h-6" />
@@ -240,7 +294,7 @@
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
-                <DialogTitle>Start Workout Session</DialogTitle>
+                <DialogTitle className="text-center sm:text-left">Start Workout Session</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                 <div>
@@ -290,7 +344,7 @@
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
-                <DialogTitle>Daily Quests</DialogTitle>
+                <DialogTitle className="text-center sm:text-left">Daily Quests</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 max-h-60 overflow-y-auto">
                 <div className="p-4 bg-gray-50 rounded-lg">
@@ -324,7 +378,7 @@
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
-                <DialogTitle>Upgrade Character</DialogTitle>
+                <DialogTitle className="text-center sm:text-left">Upgrade Character</DialogTitle>
               </DialogHeader>
               <div className="space-y-4">
                 <p className="text-sm text-gray-600">
@@ -368,7 +422,7 @@
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
-                <DialogTitle>Item Shop</DialogTitle>
+                <DialogTitle className="text-center sm:text-left">Item Shop</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 max-h-60 overflow-y-auto">
                 <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
@@ -407,8 +461,8 @@
         </div>
 
         {/* Main Content */}
-        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
+        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
           {/* Recent Activity */}
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
             <CardHeader>
@@ -418,7 +472,7 @@
               </CardTitle>
             </CardHeader>
             <CardContent>
-              <div className="space-y-4">
+              <div className="space-y-3 sm:space-y-4">
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
@@ -426,8 +480,8 @@
                     </div>
                     <div>
                       <p className="text-white font-medium">Morning Run</p>
-                      <p className="text-white/60 text-sm">Burned 300 calories</p>
+                      <p className="text-white/60 text-xs sm:text-sm">Burned 300 calories</p>
                     </div>
                   </div>
-                  <Badge className="bg-green-500/20 text-green-300">+50 XP</Badge>
+                  <Badge className="bg-green-500/20 text-green-300 text-xs">+50 XP</Badge>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
@@ -437,8 +491,8 @@
                     </div>
                     <div>
                       <p className="text-white font-medium">Strength Training</p>
-                      <p className="text-white/60 text-sm">45 minutes workout</p>
+                      <p className="text-white/60 text-xs sm:text-sm">45 minutes workout</p>
                     </div>
                   </div>
-                  <Badge className="bg-blue-500/20 text-blue-300">+75 XP</Badge>
+                  <Badge className="bg-blue-500/20 text-blue-300 text-xs">+75 XP</Badge>
                 </div>
               </div>
             </CardContent>
@@ -453,7 +507,7 @@
               </CardTitle>
             </CardHeader>
             <CardContent>
-              <div className="space-y-4">
+              <div className="space-y-3 sm:space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-white/80">Current Level</span>
                   <span className="text-white font-bold">{character.level}</span>
@@ -470,6 +524,15 @@
           </Card>
         </div>
       </div>
+      
+      <RewardPopup
+        isOpen={isRewardPopupOpen}
+        onClose={() => setIsRewardPopupOpen(false)}
+        rewards={pendingRewards}
+        title="Daily Rewards Claimed!"
+        onClaim={handleClaimRewards}
+      />
     </div>
   );
 };