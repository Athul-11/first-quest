@@ .. @@
 const Leaderboard: React.FC = () => {
   const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'weekly' | 'monthly'>('all');

   const { data: leaderboard, isLoading } = useQuery({
     queryKey: ['leaderboard', selectedPeriod],
     queryFn: async () => {
       const response = await fetch(`/api/leaderboard?period=${selectedPeriod}`, {
         credentials: 'include',
       });
       if (!response.ok) throw new Error('Failed to fetch leaderboard');
       return response.json();
     },
   });

   if (isLoading) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center">
-        <div className="text-white text-xl">Loading leaderboard...</div>
+        <div className="text-white text-xl px-4 text-center">Loading leaderboard...</div>
       </div>
     );
   }

   return (
     <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
-      <div className="container mx-auto px-4 py-8">
+      <div className="container mx-auto px-4 py-4 sm:py-8">
         <div className="text-center mb-8">
-          <h1 className="text-4xl font-bold text-white mb-4">Global Leaderboard</h1>
-          <p className="text-orange-200">See how you rank against other fitness heroes!</p>
+          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Global Leaderboard</h1>
+          <p className="text-orange-200 px-4">See how you rank against other fitness heroes!</p>
         </div>

         {/* Period Selector */}
-        <div className="flex justify-center mb-8">
+        <div className="flex justify-center mb-6 sm:mb-8 px-4">
           <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
-            <TabsList className="grid w-full max-w-md grid-cols-3">
+            <TabsList className="grid w-full max-w-sm sm:max-w-md grid-cols-3">
               <TabsTrigger value="all">All Time</TabsTrigger>
               <TabsTrigger value="weekly">Weekly</TabsTrigger>
               <TabsTrigger value="monthly">Monthly</TabsTrigger>
@@ -40,7 +40,7 @@
         </div>

         {/* Top 3 Podium */}
-        <div className="max-w-4xl mx-auto mb-8">
+        <div className="max-w-4xl mx-auto mb-6 sm:mb-8 px-4">
           <div className="grid grid-cols-3 gap-4 items-end">
             {/* Second Place */}
             <div className="text-center">
@@ -50,9 +50,9 @@
                   <Trophy className="w-8 h-8 text-gray-400" />
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-4">
-                  <h3 className="text-white font-bold">{leaderboard?.[1]?.username || 'TBD'}</h3>
-                  <p className="text-gray-300 text-sm">Level {leaderboard?.[1]?.level || 0}</p>
-                  <p className="text-yellow-400 font-bold">{leaderboard?.[1]?.xp || 0} XP</p>
+                  <h3 className="text-white font-bold text-sm sm:text-base">{leaderboard?.[1]?.username || 'TBD'}</h3>
+                  <p className="text-gray-300 text-xs sm:text-sm">Level {leaderboard?.[1]?.level || 0}</p>
+                  <p className="text-yellow-400 font-bold text-xs sm:text-sm">{leaderboard?.[1]?.xp || 0} XP</p>
                 </div>
               </div>
             </div>
@@ -65,9 +65,9 @@
                   <Trophy className="w-10 h-10 text-yellow-500" />
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-6">
-                  <h3 className="text-white font-bold text-lg">{leaderboard?.[0]?.username || 'TBD'}</h3>
-                  <p className="text-gray-300">Level {leaderboard?.[0]?.level || 0}</p>
-                  <p className="text-yellow-400 font-bold text-lg">{leaderboard?.[0]?.xp || 0} XP</p>
+                  <h3 className="text-white font-bold text-base sm:text-lg">{leaderboard?.[0]?.username || 'TBD'}</h3>
+                  <p className="text-gray-300 text-sm sm:text-base">Level {leaderboard?.[0]?.level || 0}</p>
+                  <p className="text-yellow-400 font-bold text-base sm:text-lg">{leaderboard?.[0]?.xp || 0} XP</p>
                 </div>
               </div>
             </div>
@@ -79,9 +79,9 @@
                   <Trophy className="w-8 h-8 text-orange-600" />
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-4">
-                  <h3 className="text-white font-bold">{leaderboard?.[2]?.username || 'TBD'}</h3>
-                  <p className="text-gray-300 text-sm">Level {leaderboard?.[2]?.level || 0}</p>
-                  <p className="text-yellow-400 font-bold">{leaderboard?.[2]?.xp || 0} XP</p>
+                  <h3 className="text-white font-bold text-sm sm:text-base">{leaderboard?.[2]?.username || 'TBD'}</h3>
+                  <p className="text-gray-300 text-xs sm:text-sm">Level {leaderboard?.[2]?.level || 0}</p>
+                  <p className="text-yellow-400 font-bold text-xs sm:text-sm">{leaderboard?.[2]?.xp || 0} XP</p>
                 </div>
               </div>
             </div>
@@ -89,7 +89,7 @@
         </div>

         {/* Full Leaderboard */}
-        <div className="max-w-4xl mx-auto">
+        <div className="max-w-4xl mx-auto px-4">
           <Card className="bg-white/10 backdrop-blur-sm border-white/20">
             <CardHeader>
               <CardTitle className="text-white flex items-center">
@@ -99,7 +99,7 @@
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
-                {leaderboard?.slice(3).map((player: any, index: number) => (
+                {leaderboard?.slice(3).map((player: any, index: number) => (
                   <div key={player.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                     <div className="flex items-center space-x-4">
                       <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
@@ -107,11 +107,11 @@
                       </div>
                       <div>
                         <p className="text-white font-medium">{player.username}</p>
-                        <p className="text-gray-400 text-sm">Level {player.level}</p>
+                        <p className="text-gray-400 text-xs sm:text-sm">Level {player.level}</p>
                       </div>
                     </div>
                     <div className="text-right">
-                      <p className="text-yellow-400 font-bold">{player.xp} XP</p>
-                      <p className="text-gray-400 text-sm">#{index + 4}</p>
+                      <p className="text-yellow-400 font-bold text-sm sm:text-base">{player.xp} XP</p>
+                      <p className="text-gray-400 text-xs sm:text-sm">#{index + 4}</p>
                     </div>
                   </div>
                 ))}