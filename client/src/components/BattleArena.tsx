@@ .. @@
 const BattleArena: React.FC = () => {
   const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
   const [battleLog, setBattleLog] = useState<string[]>([]);
+  const [isRewardPopupOpen, setIsRewardPopupOpen] = useState(false);
+  const [battleRewards, setBattleRewards] = useState<any[]>([]);
   const queryClient = useQueryClient();

   const { data: character } = useQuery({
@@ -47,6 +49,13 @@
       setBattleLog(prev => [...prev, 
         victory ? "Victory! You defeated the enemy!" : "Defeat! The enemy was too strong!"
       ]);
+      
+      if (victory) {
+        setBattleRewards([
+          { type: 'xp', amount: data.xpGained, name: 'Battle Victory XP' },
+          { type: 'coins', amount: data.coinsGained, name: 'Battle Reward' }
+        ]);
+        setIsRewardPopupOpen(true);
+      }
       
       queryClient.invalidateQueries({ queryKey: ['character'] });
       queryClient.invalidateQueries({ queryKey: ['battles'] });
@@ -54,6 +63,11 @@
     }
   });

+  const handleClaimBattleRewards = () => {
+    setBattleRewards([]);
+    setIsRewardPopupOpen(false);
+  };
+
   const startBattle = (enemyType: string) => {
     const newBattle: Battle = {
       id: Date.now().toString(),
@@ -78,7 +92,7 @@
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900">
-      <div className="container mx-auto px-4 py-8">
+      <div className="container mx-auto px-4 py-4 sm:py-8">
         <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-white mb-4">Battle Arena</h1>
           <p className="text-orange-200">Test your strength against fearsome enemies!</p>
@@ -86,7 +100,7 @@

         {!currentBattle ? (
           <div className="max-w-4xl mx-auto">
-            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
+            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
               <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                     onClick={() => startBattle('Sloth Dragon')}>
                 <CardContent className="p-6 text-center">
@@ -94,7 +108,7 @@
                     <Flame className="w-12 h-12 text-red-400 mx-auto mb-4" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Sloth Dragon</h3>
-                  <p className="text-orange-200 text-sm mb-4">A lazy but powerful dragon that hates exercise</p>
+                  <p className="text-orange-200 text-xs sm:text-sm mb-4">A lazy but powerful dragon that hates exercise</p>
                   <Badge className="bg-red-500/20 text-red-300">Difficulty: Medium</Badge>
                 </CardContent>
               </Card>
@@ -105,7 +119,7 @@
                     <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Couch Potato</h3>
-                  <p className="text-orange-200 text-sm mb-4">A sedentary creature that spreads laziness</p>
+                  <p className="text-orange-200 text-xs sm:text-sm mb-4">A sedentary creature that spreads laziness</p>
                   <Badge className="bg-green-500/20 text-green-300">Difficulty: Easy</Badge>
                 </CardContent>
               </Card>
@@ -116,7 +130,7 @@
                     <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Junk Food Giant</h3>
-                  <p className="text-orange-200 text-sm mb-4">A massive creature made of unhealthy food</p>
+                  <p className="text-orange-200 text-xs sm:text-sm mb-4">A massive creature made of unhealthy food</p>
                   <Badge className="bg-orange-500/20 text-orange-300">Difficulty: Hard</Badge>
                 </CardContent>
               </Card>
@@ -124,7 +138,7 @@
           </div>
         ) : (
           <div className="max-w-4xl mx-auto">
-            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
+            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
               {/* Player Side */}
               <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                 <CardHeader>
@@ -134,7 +148,7 @@
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
-                  <div className="text-center mb-6">
+                  <div className="text-center mb-4 sm:mb-6">
                     <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <User className="w-12 h-12 text-white" />
                     </div>
@@ -142,7 +156,7 @@
                     <p className="text-blue-200">Level {character?.level}</p>
                   </div>
                   <div className="space-y-2">
-                    <div className="flex justify-between text-sm">
+                    <div className="flex justify-between text-xs sm:text-sm">
                       <span className="text-white/80">Health</span>
                       <span className="text-white">{character?.health}/{character?.maxHealth}</span>
                     </div>
@@ -159,7 +173,7 @@
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
-                  <div className="text-center mb-6">
+                  <div className="text-center mb-4 sm:mb-6">
                     <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Flame className="w-12 h-12 text-white" />
                     </div>
@@ -167,7 +181,7 @@
                     <p className="text-red-200">Boss Enemy</p>
                   </div>
                   <div className="space-y-2">
-                    <div className="flex justify-between text-sm">
+                    <div className="flex justify-between text-xs sm:text-sm">
                       <span className="text-white/80">Health</span>
                       <span className="text-white">{currentBattle.enemyHealth}/100</span>
                     </div>
@@ -179,7 +193,7 @@
             </div>

             {/* Battle Actions */}
-            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
+            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
               <Button
                 onClick={() => performAction('cardio')}
                 disabled={createBattle.isPending}
@@ -206,7 +220,7 @@
             <Card className="bg-white/10 backdrop-blur-sm border-white/20">
               <CardHeader>
                 <CardTitle className="text-white flex items-center">
-                  <Scroll className="w-5 h-5 mr-2" />
+                  <Scroll className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                   Battle Log
                 </CardTitle>
               </CardHeader>
@@ -214,7 +228,7 @@
                 <div className="max-h-40 overflow-y-auto space-y-2">
                   {battleLog.map((log, index) => (
                     <div key={index} className="p-2 bg-white/5 rounded text-white text-sm">
                       {log}
                     </div>
                   ))}
                 </div>
@@ -223,6 +237,14 @@
           </div>
         )}
       </div>
+      
+      <RewardPopup
+        isOpen={isRewardPopupOpen}
+        onClose={() => setIsRewardPopupOpen(false)}
+        rewards={battleRewards}
+        title="Battle Victory!"
+        onClaim={handleClaimBattleRewards}
+      />
     </div>
   );
 };